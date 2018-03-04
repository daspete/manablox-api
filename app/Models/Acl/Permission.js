'use strict'

const Model = use('Model')

class Permission extends Model {

    static get rules() {
        return {
            permission_title: 'required|unique:permissions',
            permission_slug: 'required|unique:permissions'
        }
    }

    static get createTimestamp() {
        return null
    }

    static get updateTimestamp() {
        return null
    }

    /**
    * Many-To-Many Relationship Method for Permission.roles
    *
    * @return Object
    */
    roles() {
        return this.belongsToMany('App/Models/Acl/Role')
    }

}

module.exports = Permission
