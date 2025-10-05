from fastapi import APIRouter, HTTPException, Request, Depends
import stripe
from ..core.config import settings
from ..services.auth import AuthService

router = APIRouter(prefix="/billing", tags=["billing"])
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-checkout-session")
async def create_checkout_session(
    price_id: str,
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Create Stripe checkout session for subscription
    """
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=None,  # Will be collected in checkout
            client_reference_id=user_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url="http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/pricing",
        )
        return {"url": checkout_session.url, "session_id": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(
    customer_id: str,
    user_id: str = Depends(AuthService.verify_clerk_token)
):
    """
    Create Stripe customer portal session for managing subscription
    """
    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="http://localhost:3000/dashboard",
        )
        return {"url": portal_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhooks for subscription events
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # Handle successful subscription
        # TODO: Update user subscription status in database
        pass
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        # Handle subscription update
        pass
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        # Handle subscription cancellation
        pass

    return {"status": "success"}
