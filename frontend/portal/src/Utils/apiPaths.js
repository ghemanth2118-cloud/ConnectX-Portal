export const BASE_URL = "https://nexus-poi8.onrender.com";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GOOGLE: "/api/auth/google",
    GET_PROFILE: "/api/auth/me",
    DELETE_RESUME: "/api/auth/delete-resume",
  },
  DASHBOARD: {
    OVERVIEW: "/api/dashboard/overview",
  },
  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_DETAILS: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/employer",
    GET_JOBS_BY_ID: (id) => `/api/jobs/${id}`,
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,
  },
  SAVED_JOBS: {
    SAVE_JOB: (id) => `/api/saved-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/saved-jobs/${id}`,
    GET_SAVED_JOBS: "/api/saved-jobs/my",
  },
  APPLICATIONS: {
    APPLY_JOB: "/api/applications",
    GET_MY_APPLICATIONS: "/api/applications/my-applications",
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
    UPLOAD_FILE: "/api/auth/upload-file",
  },
  EVENTS: {
    GET_EVENTS: "/api/events",
    CREATE_EVENT: "/api/events",
    GET_EVENT_BY_ID: (id) => `/api/events/${id}`,
    DELETE_EVENT: (id) => `/api/events/${id}`,
  },
  USER: {
    SEARCH: "/api/user/search",
    GET_PROFILE: (id) => `/api/user/${id}`,
    UPDATE_PROFILE: "/api/user/profile",
    FOLLOW: (id) => `/api/user/${id}/follow`,
    UNFOLLOW: (id) => `/api/user/${id}/unfollow`,
  },
  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
  }
};