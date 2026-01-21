#!/bin/bash
# Generate secure keys for deployment

echo "=== Flower Delivery App - Secure Key Generator ==="
echo ""

echo "SECRET_KEY:"
python3 -c "import secrets; print(secrets.token_hex(32))"
echo ""

echo "JWT_SECRET_KEY:"
python3 -c "import secrets; print(secrets.token_hex(32))"
echo ""

echo "Copy these values to your Render environment variables!"
echo ""
echo "Keep these SECRET and SECURE - never commit them to version control."
