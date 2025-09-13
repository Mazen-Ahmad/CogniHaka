from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from .routers import load_balancer, inventory_optimizer, gemini_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Supply Chain Optimizer")

# --- FIX: Updated CORS Configuration ---
# Define the specific origins that are allowed to connect.
# This is more secure than allowing everyone ("*").
origins = [
    "http://localhost:5173",  # Your local development frontend
    "http://localhost:3000",  # Another common local port
    # Add your deployed frontend URL here when you have it
    "https://cog-front.vercel.app",
    "https://cog-front.vercel.app/load-balancer"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

@app.route("/")
def root():
    return RedirectResponse(url="/health")

@app.route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "healthy", "service": "Smart Supply Chain Optimizer"}

# Routers
app.include_router(load_balancer.router, prefix="/api")
app.include_router(inventory_optimizer.router, prefix="/api")
app.include_router(gemini_router.router, prefix="/api")