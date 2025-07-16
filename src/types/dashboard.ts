// Dashboard API types based on actual API responses

// General Statistics
export interface DashboardStats {
  totalPatients: number;
  totalSurgeries: number;
  pendingSurgeries: number;
  scheduledSurgeries: number;
  completedSurgeries: number;
  cancelledSurgeries: number;
  totalDoctors: number;
  activeDoctors: number;
  totalUsers: number;
  activeUsers: number;
}

// Surgery Analytics
export interface SurgeryAnalytics {
  period: string;
  totalSurgeries: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byOperatingRoom: Record<string, number>;
  timeline: {
    date: string;
    count: number;
    completed: number;
    cancelled: number;
  }[];
}

// Patient Analytics
export interface PatientAnalytics {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  newPatientsThisMonth: number;
  newPatientsThisWeek: number;
  recentPatients: {
    id: number;
    full_name: string;
    rut: string;
    created_at: string;
    totalsurgeries: string;
    totalSurgeries: number | null;
  }[];
  patientsByMonth: {
    month: string;
    count: number;
  }[];
}

// Doctor Performance
export interface DoctorPerformance {
  totalDoctors: number;
  activeDoctors: number;
  doctorStats: {
    id: number;
    first_name: string;
    last_name: string;
    totalSurgeries: number | null;
    completedSurgeries: number | null;
    pendingSurgeries: number | null;
    averageDuration: number;
    successRate: number;
  }[];
  topPerformers: {
    doctorId: number;
    doctorName: string;
    totalSurgeries: number | null;
    successRate: number;
  }[];
}

// Operating Room Utilization
export interface RoomUtilization {
  date: string;
  rooms: {
    name: string;
    totalSlots: number;
    occupiedSlots: number;
    utilizationRate: number;
    surgeries: {
      id: string;
      surgery_type: string;
      patient_name: string;
      doctor_name: string;
      start_time: string;
      duration: number;
      status: string;
    }[];
  }[];
  overallUtilization: number;
}

// Revenue Analytics
export interface RevenueAnalytics {
  thisMonth: {
    totalRevenue: number;
    totalSurgeries: number;
    averagePerSurgery: number;
  };
  lastMonth: {
    totalRevenue: number;
    totalSurgeries: number;
    averagePerSurgery: number;
  };
  growth: {
    revenueGrowth: number;
    surgeriesGrowth: number;
  };
  byMonth: Record<string, unknown>[]; // Array of month data objects
}

// Real-time Dashboard
export interface RealtimeDashboard {
  currentDateTime: string;
  todayStats: {
    scheduledSurgeries: number;
    completedSurgeries: number;
    inProgressSurgeries: number;
    pendingSurgeries: number;
  };
  activeDoctors: number;
  busyOperatingRooms: number;
  nextSurgeries: {
    id: string;
    patient_name: string;
    doctor_name: string;
    surgery_type: string;
    scheduled_time: string;
    operating_room: string;
    priority: string;
  }[];
}

// Alerts and Notifications
export interface DashboardAlerts {
  alerts: Record<string, unknown>[]; // Array of alert objects
  unreadCount: number;
}

// API Query Parameters
export interface SurgeryAnalyticsParams {
  period?: 'week' | 'month' | 'quarter' | 'year';
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
}

export interface RoomUtilizationParams {
  date?: string; // YYYY-MM-DD, defaults to today
  period?: 'day' | 'week' | 'month'; // defaults to day
}