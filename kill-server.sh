lsof -t -i tcp:$1 -sTCP:LISTEN -n | xargs kill
