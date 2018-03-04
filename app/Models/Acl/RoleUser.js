'use strict'

const Model = use('Model')

class RoleUser extends Model {

    static get table() {
        return 'role_user'
    }

    static get rules() {
        return {
            role_id: 'required',
            user_id: 'required'
        }
    }

    static get createTimestamp() {
        return null
    }

    static get updateTimestamp() {
        return null
    }

}

module.exports = RoleUser