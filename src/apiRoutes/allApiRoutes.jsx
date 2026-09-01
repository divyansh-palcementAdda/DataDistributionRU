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
        // get lead follow-ups
        getFollowUps: '/api/leads/{id}/followups',
        // mark a lead .
        markLead: '/api/leads/followups/{followUpId}/complete',
        completeFollowUp: '/api/leads/followups/{followUpId}/complete',
        infoPanel: '/api/leads/{leadId}/info-panel',
        sendWhatsApp: '/api/leads/{leadId}/course-template/whatsapp',
        sendEmail: '/api/leads/{leadId}/course-template/email',
        reassign: '/api/leads/reassign',
        reassignDistribute: '/api/leads/reassign/distribute',
        changeStatus: '/api/leads/{id}/change-status',
        statusHistory: '/api/leads/{id}/status-history',
        avail: '/api/leads/{id}/avail',
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
        getById: "/api/users/{id}",
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
        details: '/api/courses/{id}',
        communicationConfig: '/api/courses/{courseId}/communication-config',
        uploadImage: '/api/courses/{courseId}/images',
        getImages: '/api/courses/{courseId}/images'
    },

    CourseImage: {
        update: '/api/course-images/{imageId}',
        delete: '/api/course-images/{imageId}'
    },

    LeadStatus: {
        create: '/api/lead-statuses',
        getAll: '/api/lead-statuses',
        update: '/api/lead-statuses/{id}',
        delete: '/api/lead-statuses/{id}',
        toggle: '/api/lead-statuses/{id}/toggle-active',
        getDetailsById: '/api/lead-statuses/{id}',
        getActive: '/api/lead-status/active'
    },

    Email: {
        send: '/api/emails/send',
        test: '/api/emails/test',
        logs: '/api/emails/logs',
        status: '/api/emails/config/status',
    },

    FollowUp: {
        getAllFollowUps: "/api/followups",
        getByUser: "/api/followups/user/{userId}",
        getToday: "/api/followups/today",
        getPending: "/api/followups/pending",
        getCompleted: "/api/followups/completed",
        reschedule: "/api/followups/{id}/reschedule",
        complete: "/api/followups/{id}/complete",
        cancel: "/api/followups/{id}/cancel",
        reassign: "/api/follow-ups/reassign",
        reassignDistribute: "/api/follow-ups/reassign/distribute",
        completeFollowup: "/api/followups/{id}/complete",
        cancelFollowup: "/api/followups/{id}/cancel",
    },

    Grads: {
        create: '/api/grades',
        getAll: '/api/grades',
        getById: '/api/grades/{id}',
        update: '/api/grades/{id}',
        delete: '/api/grades/{id}',
        toggle: '/api/grades/{id}/toggle-active'
    },

    Boards: {
        create: '/api/boards',
        getAll: '/api/boards',
        getById: '/api/boards/{id}',
        update: '/api/boards/{id}',
        delete: '/api/boards/{id}',
        toggle: '/api/boards/{id}/toggle-active'
    },

    CourseTemplate: {
        create: '/api/course-templates',
        getAll: '/api/course-templates',
        update: '/api/course-templates/{id}',
        delete: '/api/course-templates/{id}',
        getByCourseId: '/api/courses/{courseId}/templates',
        getById: '/api/course-templates/{id}',
    },

    USP: {
        add: '/api/courses/{courseId}/usps',
        getAll: '/api/courses/{courseId}/usps',
        update: '/api/course-usps/{uspId}',
        delete: '/api/course-usps/{uspId}',
    },

    Dashboard: {
        leadStatus: '/api/dashboard/lead-status',
        leadSource: '/api/dashboard/lead-source',
        grade: '/api/dashboard/grade',
        course: '/api/dashboard/course',
        board: '/api/dashboard/board',
        courseTypes: '/api/dashboard/course-types',
        recentActivity: '/api/dashboard/recent-activity',
        summary: '/api/dashboard/summary',
        lowDataUsers: '/api/dashboard/low-data-users',
        usersNotLoggedIn: '/api/dashboard/users-not-logged-in',
        followupUsersNotLoggedIn11am: '/api/dashboard/followup-users-not-logged-in-11am',
        //its all cards 
        unallottedCount: '/api/dashboard/leads/unallotted/count',
        availedCount: '/api/dashboard/leads/availed/count',
        allottedCount: '/api/dashboard/leads/allotted/count',
        followupStatusCounts: '/api/dashboard/followups/status-counts',
    },

    Distribution: {
        preview: '/api/leads/distribute/preview',
        distribute: '/api/leads/distribute',
    },

    Department: {
        create: '/api/departments',
        getAll: '/api/departments',
        getDetailsById: '/api/departments/{id}',
        update: '/api/departments/{id}',
        delete: '/api/departments/{id}',
        toggle: '/api/departments/{id}/toggle-active',
        getUsers: '/api/departments/{id}/users',
        getHods: '/api/departments/{id}/hods',
        getCounsellors: '/api/departments/{id}/counsellors'
    },

    Dropdowns: {
        boards: '/api/dropdowns/boards',
        courseTypes: '/api/dropdowns/course-types',
        courses: '/api/dropdowns/courses',
        departments: '/api/dropdowns/departments',
        grades: '/api/dropdowns/grades',
        leadSources: '/api/dropdowns/lead-sources',
        leadStatuses: '/api/dropdowns/lead-statuses',
        roles: '/api/dropdowns/roles',
        users: '/api/dropdowns/users',
        followupStatuses: '/api/dropdowns/followup-statuses',
        followupLeadStatuses: '/api/dropdowns/followup-lead-statuses'
    },

    DataSegregation: {
        courseTypes: '/api/data-segregation/course-types',
        matrix: '/api/data-segregation/matrix',
        userAnalytics: '/api/data-segregation/user-analytics',
        leadStatusAnalytics: '/api/data-segregation/lead-status-analytics'
    }
}

export default ApiRoutes;

