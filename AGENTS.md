Api:

1. use global middleware for all routes, and use route-specific middleware for specific routes.
2. controller should be thin, and service should be fat. controller only responsible for receiving request, validate and returning response, and service responsible for business logic.
3. don't return model directly from service, instead return only required fields.
4. in class files interfaces or utility functions must be put on bottom.
5. No unit test needed unless asked explicitely
6. Refer [module-design-guide.md](module-design-guide.md) while creating new api.

Shared:
1. Keep the code shared across be and fe in shared folder
