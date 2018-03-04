'use strict'

class CheckPermission {
    async handle({ request, auth, response }, next, permission){
        const isLoggedIn = await auth.check()

        if(isLoggedIn){
            const user = await auth.getUser()

            if(await user.can(permission)){
                await next()
                return;

            }
        }

        response.forbidden('You do not have permission to see that section')
    }
}

module.exports = CheckPermission
