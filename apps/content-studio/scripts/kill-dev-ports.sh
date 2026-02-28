#!/usr/bin/env bash
# Ukončí procesy na portech 3000, 3001, 3002 (staré instance Next.js dev serveru).
# Spusťte z příkazové řádky: ./scripts/kill-dev-ports.sh
# Nebo: bash scripts/kill-dev-ports.sh

for port in 3000 3001 3002; do
  pids=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pids" ]; then
    echo "Port $port: ukončuji PID $pids"
    echo "$pids" | xargs kill -9 2>/dev/null && echo "  -> OK" || echo "  -> (zkuste: kill -9 $pids)"
  else
    echo "Port $port: volný"
  fi
done
echo "Hotovo. Můžete spustit: npm run dev"
