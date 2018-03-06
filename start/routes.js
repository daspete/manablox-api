'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')

Route.get('/', ({ request }) => {
    return { greeting: 'Hello world in JSON' }
})

Route.group(() => {

    Route.post('auth/login', 'AuthController.login')
    Route.get('auth/logout', 'AuthController.logout').middleware('auth')
    Route.get('auth/me', 'AuthController.me').middleware('auth')

    Route.resource('users', 'UsersController').middleware(new Map([
        [['index'], ['auth', 'acl:users_view']],
        [['show'], ['auth', 'acl:users_view']],
        [['store'], ['auth', 'acl:users_create']],
        [['update', 'delete'], ['auth', 'acl:users_edit']],
        [['destroy'], ['auth', 'acl:users_delete']]
    ]))

    Route.resource('permissions', 'PermissionController').middleware(['auth', 'acl:acl_view'])
    Route.resource('roles', 'RoleController').middleware(['auth', 'acl:acl_view'])
    Route.resource('permissions-roles', 'PermissionsRoleController').middleware(['auth', 'acl:acl_view'])
    Route.resource('users-roles', 'RolesUserController').middleware(['auth', 'acl:acl_view'])

    Route.resource('models', 'DataModelController').middleware(['auth'])

    Route.get('data/:slug', 'DataModelDataController.index')
    Route.post('data/:slug', 'DataModelDataController.store')
    Route.put('data/:slug/:id', 'DataModelDataController.update')
    Route.delete('data/:slug/:id', 'DataModelDataController.destroy')



}).prefix('api/v1')
