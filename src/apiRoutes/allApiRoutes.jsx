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
        allotmentHistory: '/api/leads',
        sourceWiseStats: '/api/leads/stats/source-wise',
        //schedule lead ......
        leadSchedule: '/api/leads/{id}/followups',
        // mark a lead .
        markLead: '/api/leads/followups/{followUpId}/complete',
        completeFollowUp: '/api/leads/followups/{followUpId}/complete',
    },
    Lead_Source: {
        create: '/api/lead-sources',
        getAll: '/api/lead-sources',
        getDetailsById: '/api/lead-sources/{id}',
        update: '/api/lead-sources/{id}',
        delete: '/api/lead-sources/{id}',
        toggle: '/api/lead-sources/{id}/toggle-active'
    },
    Users: {
        getAllUser: "/api/users",
        create: "/api/users",
        update: "/api/users/{id}",
        delete: "/api/users/{id}",
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
    },

    LeadStatus: {
        create: '/api/lead-status',
        getAll: '/api/lead-status',
        update: '/api/lead-status/{id}',
        delete: '/api/lead-status/{id}',
        toggle: '/api/lead-status/{id}/toggle-active',
        getDetailsById: '/api/lead-status/{id}',
        getActive: '/api/lead-status/active'
    },

    FollowUp: {
        getAllFollowUps: "/api/followups",

    }
}

export default ApiRoutes;   
