'use strict'

class AuthController {

    async login({request, auth, response}){
        const { email, password } = request.all()

        try {
            const login = await auth.attempt(email, password)

            if(login){
                await response.status(200).send(login);
            }else{
                await response.status(401).send('Unauthorized');
            }

        }catch(e){
            await response.status(401).send({ error: e.message })
        }
    }

    async logout({ request, auth, response }){
        await auth.revokeTokens([ auth.getAuthHeader() ]);

        await response.status(200).send({ success: true });
    }

    async me({ request, auth, response }){
        try {
            await response.status(200).send({ user: await auth.getUser() });
        }catch(e){
            await response.status(401).send({ error: e.message })
        }
    }

}

module.exports = AuthController
