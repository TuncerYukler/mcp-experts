from setuptools import setup, find_packages

setup(
    name="mcp-experts",
    version="0.1.0",
    description="MCP Expert System for code reviews",
    author="Your Name",
    packages=find_packages(),
    install_requires=[
        "modelcontextprotocol",
        "fastapi>=0.104.0",
        "uvicorn>=0.23.2",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "pydantic>=2.3.0",
        "python-dotenv>=1.0.0",
        "httpx>=0.24.0",
    ],
    dependency_links=[
        "git+https://github.com/modelcontextprotocol/python-sdk.git#egg=modelcontextprotocol",
    ],
    entry_points={
        "console_scripts": [
            "mcp-experts=server:main",
        ],
    },
    python_requires=">=3.10",
) 