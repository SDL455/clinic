export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth();

  // Allow access to login page
  if (to.path === "/login") {
    return;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn.value) {
    return navigateTo("/login");
  }
});

