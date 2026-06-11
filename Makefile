.PHONY: build preview run

CONFIG ?= "app.json"
BASE_PATH ?= "/todo"
OUT_DIR ?= "target/dist"
PORT ?= "3071"

# make build CONFIG=app.json BASE_PATH=/todo
build:
	$(if $(CONFIG),VITE_APP_CONFIG=$(CONFIG)) VITE_APP_BASE_PATH=$(BASE_PATH) \
	npm run build -- --outDir $(OUT_DIR)

preview:
	npm run preview -- --host=0.0.0.0 --port=3071

#typecheck:
#	npm run typecheck

# make build PORT=3071
run:
	VITE_APP_CONFIG=app.local.json VITE_APP_BASE_PATH=/ \
	npm run dev -- --host=0.0.0.0 $(if $(PORT),--port $(PORT),)
