docker run --rm --name my-custom-nginx-container \
    -p 8080:80 \
    -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/01-adobe.pem:/etc/nginx/client.pem:ro \
    -v $(pwd)/01-adobe.key:/etc/nginx/client.key:ro \
    nginx \
#    nginx -T