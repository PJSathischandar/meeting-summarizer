from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from ..core.config import settings

security = HTTPBearer()


class AuthService:
    @staticmethod
    async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
        """
        Verify Clerk JWT token and return user ID
        """
        token = credentials.credentials
        
        # Verify token with Clerk
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    "https://api.clerk.com/v1/sessions/verify",
                    headers={
                        "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                        "Content-Type": "application/json"
                    },
                    params={"token": token}
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=401, detail="Invalid authentication token")
                
                data = response.json()
                return data.get("user_id")
            except Exception as e:
                raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
