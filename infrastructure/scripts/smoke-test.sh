#!/bin/bash

set -e

echo "🧪 Running smoke tests..."

# Get instance IP
INSTANCE_IP=$(terraform -chdir=infrastructure/terraform output -raw public_ip 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    echo "❌ Could not get instance IP"
    exit 1
fi

echo "Testing instance: $INSTANCE_IP"

# Test endpoints
ENDPOINTS=(
    "/"
    "/api"
    "/api/certificates"
    "/api/death-certificates"
    "/api/marriage-certificates"
)

FAILED=0

for endpoint in "${ENDPOINTS[@]}"; do
    URL="http://${INSTANCE_IP}${endpoint}"
    echo -n "Testing $URL... "
    
    if curl -s -f --max-time 10 "$URL" > /dev/null; then
        echo "✅ PASS"
    else
        echo "❌ FAIL"
        FAILED=1
    fi
done

# Test response time
echo -n "Testing response time... "
START_TIME=$(date +%s%N)
curl -s -f "http://${INSTANCE_IP}" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
echo "Response time: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -gt 2000 ]; then
    echo "⚠️  WARNING: High response time"
fi

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All smoke tests passed!"
    echo "✅ Application is running correctly"
    echo "🌐 URL: http://${INSTANCE_IP}"
else
    echo ""
    echo "❌ Some smoke tests failed"
    exit 1
fi
