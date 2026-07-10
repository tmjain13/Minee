import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Quote, 
  Newspaper, 
  ChevronRight, 
  ShieldAlert, 
  Loader2, 
  Search, 
  Users, 
  AlertCircle, 
  Plus, 
  Shield, 
  User, 
  ArrowLeft,
  Bell,
  Trash2,
  Calendar,
  Download,
  ArrowUpDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import ViharUpdateForm from './ViharUpdateForm';
import { useAuth } from '../context/AuthContext';
import { SkeletonLoader } from './SkeletonLoader';

interface AdminDashboardProps {
  onBackToProfile?: () => void;
}

// Robust Error Boundary for resilient rendering
class AdminDashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AdminDashboard Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl max-w-md mx-auto my-12 text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-rose-800 dark:text-rose-400 font-sans">संरचना त्रुटि (Render Error)</h2>
          <p className="text-xs text-rose-600 dark:text-rose-300 mt-2 mb-4 font-mono">
            {this.state.error?.message || "An error occurred while loading the Admin Dashboard."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            पुनः प्रयास करें (Try Again)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Secure Firestore Error Handling as mandated by guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AdminDashboardContent: React.FC<AdminDashboardProps> = ({ onBackToProfile }) => {
  console.log("Admin Dashboard Rendering with Expanded Security Panel");

  const { userData, loading: authLoading, user } = useAuth();
  const [activeSubView, setActiveSubView] = useState<'menu' | 'vihar' | 'users_mgmt'>('menu');
  
  // Real-time Lists State
  const [users, setUsers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Searching & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Sorting State
  const [sortField, setSortField] = useState<'displayName' | 'createdAt'>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // UI Feedback / Alerts state
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New alert creation
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'info' | 'warning' | 'error'>('info');
  const [creatingAlert, setCreatingAlert] = useState(false);

  // Group signups for last 30 days
  const signupData = useMemo(() => {
    const dailyCounts: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyCounts[dateString] = 0;
    }

    users.forEach((u: any) => {
      let date: Date | null = null;
      if (u.createdAt) {
        if (typeof u.createdAt.toDate === 'function') {
          date = u.createdAt.toDate();
        } else if (u.createdAt.seconds) {
          date = new Date(u.createdAt.seconds * 1000);
        } else if (u.createdAt instanceof Date) {
          date = u.createdAt;
        } else if (typeof u.createdAt === 'string' || typeof u.createdAt === 'number') {
          date = new Date(u.createdAt);
        }
      }
      
      if (date && !isNaN(date.getTime())) {
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateString in dailyCounts) {
          dailyCounts[dateString]++;
        }
      }
    });

    return Object.keys(dailyCounts).map(date => ({
      date,
      Count: dailyCounts[date]
    }));
  }, [users]);

  // Sort Users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'displayName') {
        valA = (valA || 'Anonymous User').toString().toLowerCase();
        valB = (valB || 'Anonymous User').toString().toLowerCase();
      } else if (sortField === 'createdAt') {
        const getMs = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val.seconds) return val.seconds * 1000;
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          const date = new Date(val);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        };
        valA = getMs(valA);
        valB = getMs(valB);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

  // Filter Users
  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(u => {
      const name = (u.displayName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const queryStr = searchTerm.toLowerCase();
      return name.includes(queryStr) || email.includes(queryStr);
    });
  }, [sortedUsers, searchTerm]);

  // Sorting handler
  const handleSort = (field: 'displayName' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // CSV Export handler
  const exportToCSV = (usersToExport: any[]) => {
    try {
      const headers = ["Name,Email,UID,CreatedAt"];
      const csvContent = usersToExport.map(u => {
        let dateStr = 'No Date';
        if (u.createdAt) {
          let date: Date | null = null;
          if (typeof u.createdAt.toDate === 'function') {
            date = u.createdAt.toDate();
          } else if (u.createdAt.seconds) {
            date = new Date(u.createdAt.seconds * 1000);
          } else if (u.createdAt instanceof Date) {
            date = u.createdAt;
          } else {
            date = new Date(u.createdAt);
          }
          if (date && !isNaN(date.getTime())) {
            dateStr = date.toISOString();
          }
        }
        const name = (u.displayName || "Anonymous").replace(/"/g, '""').replace(/,/g, " ");
        const email = (u.email || "No Email").replace(/"/g, '""').replace(/,/g, " ");
        return `"${name}","${email}","${u.id}","${dateStr}"`;
      }).join("\n");
      
      const blob = new Blob([headers.join("\n") + "\n" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'terapanth_users_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      setFeedback({ message: "उपयोगकर्ता सूची सफलतापूर्वक निर्यात की गई! (Users list exported successfully!)", type: 'success' });
    } catch (error) {
      console.error("Export failed: ", error);
      setFeedback({ message: "सूची निर्यात करने में असमर्थ। (Failed to export users list.)", type: 'error' });
    }
  };

  // Delete User handler
  const handleDeleteUser = async (userId: string, displayName: string) => {
    const confirmDelete = window.confirm(
      `क्या आप सचमुच इस उपयोगकर्ता को हटाना चाहते हैं?\nAre you sure you want to delete user "${displayName || 'Anonymous'}"?`
    );
    if (!confirmDelete) return;

    const userPath = `users/${userId}`;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setFeedback({
        message: `उपयोगकर्ता "${displayName || 'Anonymous'}" सफलतापूर्वक हटा दिया गया। (User deleted successfully.)`,
        type: 'success'
      });
      console.log(`Successfully deleted user: ${userId}`);
    } catch (error) {
      setFeedback({
        message: `त्रुटि: उपयोगकर्ता को हटाया नहीं जा सका। (Failed to delete user.)`,
        type: 'error'
      });
      handleFirestoreError(error, OperationType.DELETE, userPath);
    }
  };

  // Dismiss feedback automatically
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // 1. Real-time system alerts listener with complete mandated error handling
  useEffect(() => {
    if (activeSubView !== 'users_mgmt') return;

    const alertsPath = 'system_alerts';
    console.log("[AdminDashboard] Subscribing to system alerts in real-time...");
    const q = query(collection(db, alertsPath), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(newAlerts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, alertsPath);
    });

    return unsubscribe;
  }, [activeSubView]);

  // 2. Real-time users list listener with complete mandated error handling
  useEffect(() => {
    if (activeSubView !== 'users_mgmt') return;

    const usersPath = 'users';
    console.log("[AdminDashboard] Subscribing to users collection in real-time...");
    
    const unsubscribe = onSnapshot(collection(db, usersPath), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
      setLoadingUsers(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, usersPath);
    });

    return unsubscribe;
  }, [activeSubView]);

  // Handle role modification
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const userPath = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      console.log(`Successfully updated role for ${userId} to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  };

  // Handle adding custom alert for live verification
  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;

    setCreatingAlert(true);
    const alertsPath = 'system_alerts';
    try {
      await addDoc(collection(db, alertsPath), {
        message: alertMessage.trim(),
        severity: alertSeverity,
        timestamp: serverTimestamp()
      });
      setAlertMessage('');
      console.log("Successfully published new system alert to Firestore.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, alertsPath);
    } finally {
      setCreatingAlert(false);
    }
  };

  // Handle alert deletion
  const handleDeleteAlert = async (alertId: string) => {
    const alertPath = `system_alerts/${alertId}`;
    try {
      await deleteDoc(doc(db, 'system_alerts', alertId));
      console.log("Deleted system alert:", alertId);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, alertPath);
    }
  };

  // 3. Loading State: Show clean "Loading..." instead of blank page
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse font-sans">
          लोड हो रहा है... (Loading Admin Services...)
        </p>
      </div>
    );
  }

  // Check if authorized (redundant guard just in case direct access is triggered)
  const isAuthorized = user && userData?.role === 'admin';
  
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans">पहुँच अस्वीकृत (Access Denied)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-sm font-sans">
          आपके पास इस व्यवस्थापक (Admin) पैनल को देखने की अनुमति नहीं है। केवल अधिकृत व्यवस्थापक ही इसे एक्सेस कर सकते हैं।
        </p>
        {onBackToProfile && (
          <button
            onClick={onBackToProfile}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs cursor-pointer font-sans"
          >
            वापस जाएँ (Go Back)
          </button>
        )}
      </div>
    );
  }

  // View Routing: Vihar Update Subview
  if (activeSubView === 'vihar') {
    return <ViharUpdateForm onBack={() => setActiveSubView('menu')} />;
  }

  // View Routing: Users & System Alerts Subview
  if (activeSubView === 'users_mgmt') {
    // Search and Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe pt-6 px-4 animate-fadeIn">
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <button
              onClick={() => setActiveSubView('menu')}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य मेनू (Main Menu)</span>
            </button>
            <h1 className="text-sm font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest font-mono">
              Users & System Alerts
            </h1>
          </div>

          {/* Feedback Toast Notification Banner */}
          {feedback && (
            <div className={`p-3.5 rounded-2xl text-xs font-sans text-center font-bold shadow-sm border transition-all animate-bounce ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' 
                : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* User Sign-ups Analytics Panel (Recharts) */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white font-sans">
                  नए उपयोगकर्ता (Sign-ups - Last 30 Days)
                </h2>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold font-mono">
                30 Days Metrics
              </span>
            </div>
            
            <div className="w-full h-48 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700/30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9 }} 
                    stroke="#94a3b8" 
                    dy={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    stroke="#94a3b8" 
                    allowDecimals={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Count" 
                    stroke="#ea580c" 
                    strokeWidth={2.5} 
                    dot={{ r: 2 }} 
                    activeDot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time alerts notification box */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white font-sans">
                  सिस्टम अलर्ट्स (Real-time Alerts)
                </h2>
              </div>
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold font-mono">
                {alerts.length} Active
              </span>
            </div>

            {/* Quick alert generator form */}
            <form onSubmit={handleAddAlert} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="नया अलर्ट संदेश टाइप करें..."
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-orange-500 font-sans"
                />
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none font-sans"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <button
                  type="submit"
                  disabled={creatingAlert || !alertMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {creatingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>भेजें</span>
                </button>
              </div>
            </form>

            {/* Alert List with delete functionality */}
            <div className="space-y-2 max-h-48 overflow-y-auto pt-2 scrollbar-thin">
              {alerts.length === 0 ? (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic py-2 text-center font-sans">
                  कोई सक्रिय अलर्ट नहीं है (No active system alerts)
                </p>
              ) : (
                alerts.map((alert) => {
                  const severityColors = 
                    alert.severity === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' :
                    alert.severity === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                    'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 border-sky-100 dark:border-sky-900/30';

                  return (
                    <div 
                      key={alert.id} 
                      className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${severityColors}`}
                    >
                      <div className="flex gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="font-sans leading-relaxed">{alert.message}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 cursor-pointer p-0.5 shrink-0"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* User management list */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white font-sans">
                  उपयोगकर्ता प्रबंधन (User Administration)
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportToCSV(users)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold text-[10px] px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:border-orange-500/50"
                  title="CSV के रूप में निर्यात करें (Export to CSV)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold font-mono">
                  Total: {filteredUsers.length}
                </span>
              </div>
            </div>

            {/* Live Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-orange-500 font-sans"
                placeholder="नाम या ईमेल से खोजें... (Search by name or email)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
            </div>

            {/* Dynamic Content Loader */}
            {loadingUsers ? (
              <SkeletonLoader />
            ) : filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-8 text-center font-sans">
                कोई उपयोगकर्ता नहीं मिला (No matching users found)
              </p>
            ) : (
              <div className="space-y-2">
                {/* Sorting Headers Bar */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-400 dark:text-slate-500 font-sans border border-slate-100/50 dark:border-slate-800/40">
                  <button 
                    onClick={() => handleSort('displayName')} 
                    className="flex items-center gap-1 hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    <span>Name & Email</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    {sortField === 'displayName' && (
                      <span className="text-orange-500 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleSort('createdAt')} 
                    className="flex items-center gap-1 hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    <span>Registration Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    {sortField === 'createdAt' && (
                      <span className="text-orange-500 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                  
                  <span className="pr-4 uppercase">Actions</span>
                </div>

                {paginatedUsers.map((u) => {
                  // Format creation date for UI
                  let regDate = 'N/A';
                  if (u.createdAt) {
                    let d: Date | null = null;
                    if (typeof u.createdAt.toDate === 'function') {
                      d = u.createdAt.toDate();
                    } else if (u.createdAt.seconds) {
                      d = new Date(u.createdAt.seconds * 1000);
                    } else if (u.createdAt instanceof Date) {
                      d = u.createdAt;
                    } else {
                      d = new Date(u.createdAt);
                    }
                    if (d && !isNaN(d.getTime())) {
                      regDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    }
                  }

                  return (
                    <div 
                      key={u.id} 
                      className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col space-y-0.5 min-w-0 pr-4 flex-1">
                        <span className="font-bold text-slate-800 dark:text-white truncate font-sans">
                          {u.displayName || "Anonymous User"}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          {u.email || "No Email Provided"}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
                          UID: {u.id}
                        </span>
                      </div>

                      {/* Date Column */}
                      <div className="hidden sm:flex text-[10px] font-mono text-slate-500 dark:text-slate-400 px-4">
                        {regDate}
                      </div>

                      {/* Action controls */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Interactive Role Toggle Button */}
                        <button
                          onClick={() => handleToggleRole(u.id, u.role || 'user')}
                          className={`px-2 py-1 rounded-lg font-bold text-[9px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 border uppercase ${
                            u.role === 'admin' 
                              ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30' 
                              : 'bg-slate-200/50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                          title="Click to toggle user role"
                        >
                          {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <span>{u.role || 'user'}</span>
                        </button>

                        {/* Delete User Trash Button */}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.displayName)}
                          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="उपयोगकर्ता को हटाएं (Delete User)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  पिछला (Prev)
                </button>
                <span className="text-slate-400 font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  अगला (Next)
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // View Routing: Main Admin Menu
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe pt-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">व्यवस्थापक पैनल</h1>
              <p className="text-sm font-medium text-orange-600 font-sans">Super Admin Access</p>
            </div>
          </div>
          {onBackToProfile && (
            <button
              onClick={onBackToProfile}
              className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer font-sans"
            >
              वापस
            </button>
          )}
        </div>

        {/* Menu Cards */}
        <div className="space-y-4">
          {/* 1. Vihar Update */}
          <button
            onClick={() => setActiveSubView('vihar')}
            className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">विहार प्रवास</h3>
                <p className="text-xs text-slate-500 font-sans">आचार्य श्री का लाइव लोकेशन अपडेट करें</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>

          {/* 2. User Administration & Alerts Directory */}
          <button
            onClick={() => setActiveSubView('users_mgmt')}
            className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">उपयोगकर्ता और अलर्ट</h3>
                <p className="text-xs text-slate-500 font-sans">भूमिका प्रबंधन और लाइव अलर्ट नियंत्रण</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>

          {/* 3. Daily Quotes */}
          <button className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow group text-left cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                <Quote className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans font-sans">आज का विचार</h3>
                <p className="text-xs text-slate-500 font-sans">दैनिक प्रेरणादायक सुविचार जोड़ें</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>

          {/* 4. News */}
          <button className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow group text-left cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-sans">तेरापंथ समाचार</h3>
                <p className="text-xs text-slate-500 font-sans">समाज की नई सूचनाएं प्रकाशित करें</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Error Boundary Wrapper
const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  return (
    <AdminDashboardErrorBoundary>
      <AdminDashboardContent {...props} />
    </AdminDashboardErrorBoundary>
  );
};

export default AdminDashboard;
