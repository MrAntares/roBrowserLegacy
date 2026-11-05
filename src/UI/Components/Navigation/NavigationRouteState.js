let currentRoute = null;

export function getNavigationRoute() {
	return currentRoute;
}

export function setNavigationRoute(route) {
	currentRoute = route;
}
