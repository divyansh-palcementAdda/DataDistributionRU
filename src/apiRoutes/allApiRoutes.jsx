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
    },
    Lead_Source: {
        create: '/api/lead-sources',
        getAll: '/api/lead-sources',
        view: '/api/lead-sources',
        update: '/api/lead-sources',
        delete: '/api/lead-sources',
        toggle: '/api/lead-sources/{id}/toggle-active'
    }
}

export default ApiRoutes;   