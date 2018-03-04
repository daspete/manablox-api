'use strict'

const Model = use('Model')

class PermissionRole extends Model {

    static get table() {
        return 'permission_role'
    }

    static get createTimestamp() {
        return null
    }

    static get updateTimestamp() {
        return null
    }

}

module.exports = PermissionRole