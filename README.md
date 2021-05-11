# Node.Js Socket.Io implementation with:

- Server
- Multiple Proxies
- One Client per Proxy

- With Message Buffering in Server and Proxies
- Send Message to specific Proxies only (do not broadcast messages)

in .env file put the SERVER PORT and PROXY PORT (autoStart).

## Restore packages:
    npm i 
## Run Server:
    npm run server
## Run Proxy:
    npm run proxy
## Run Client:
    npm run client

# To run with different settings:

## [SERVER] in bash:
    SERVER_PORT=XXXX node server/server.js 

## [PROXY] in bash: (must match the SERVER_PORT above)
    SERVER_PORT=XXXX PROXY_PORT=YYYY MACHINE_ID=PI000 node proxy/proxy.js 

## [CLIENT] in bash:
    PROXY_PORT=YYYY MACHINE_ID=PI000 node proxy/proxy.js

## To send messages: in bash: (replace SERVER_PORT with the port used by the server and MACHINE_ID with the proxy/client you want to reach)

    curl --location --request POST 'localhost:SERVER_PORT/message' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "message": "this is a sample message",
        "device": "MACHINE_ID"
    }'


- You can stop any of the processes, in any order.
- The server will buffer the messages to proxies that are not connected
- The proxy will buffer the messages to client that is not connected
