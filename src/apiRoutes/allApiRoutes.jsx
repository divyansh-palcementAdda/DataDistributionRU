const ApiRoutes = {
    Auth: {
        login: '/api/auth/login',
    },
    Lead: {
        create: '/api/leads',
        getAllLeads: '/api/leads',
        update: '/api/leads',
        delete: '/api/leads',
        getById: '/api/leads',
        assignmentHistory: '/api/leads',
        sourceWiseStats: '/api/leads/stats/source-wise',
    },
    Lead_Source: {
        create: '/api/lead-sources',
        getAll: '/api/lead-sources',
        view: '/api/lead-sources',
        update: '/api/lead-sources',
        delete: '/api/lead-sources',
        toggle: '/api/lead-sources/{id}/toggle-active'
    },
    Users: {
        getAllUser: "/api/users",
        create: "/api/users",
    },
    Role: {
        getPermissions: '/api/roles',
        getAllRoles: "/api/roles",
        cretae: '/api/roles',
        upadte: '/api/roles/{id}',
        delete: '/api/roles/{id}',
        getDetailsById: "/api/roles/{id}",
        activate: "/api/roles/{id}/activate",
        deactivate: "/api/roles/{id}/deactivate",
    },
    Permission: {
        getAll: "/api/permissions",
        create: "/api/permissions",
        getDetailsById: "/api/permissions/{id}",
        update: "/api/permissions/{id}",
        delete: "/api/permissions/{id}",
    },

    Counselors: {
        // endpoint is role but work for conseller
        getAllCounselors: "/api/users/by-role"
    },

    CoursesTypes: {
        create: "/api/course-types",
        getAllCourse: "/api/course-types",
        update: "/api/course-types/{id}",
        delete: "/api/course-types/{id}",
        toggle: "/api/course-types/{id}/toggle-active",
        getDetailsById: "/api/course-types/{id}",
        getActive: "/api/course-types/active"
    },

    Course: {
        createCourse: '/api/courses',
        getAllCourses: "/api/courses",
        update: '/api/courses/{id}',
        delete: '/api/courses/{id}',
        toggle: '/api/courses/{id}/toggle-active',
        details: '/api/courses/{id}'
    }
}

export default ApiRoutes;   
