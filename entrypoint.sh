#!/bin/sh

sleep 5

npx prisma migrate deploy

exec tsx src/app.ts
