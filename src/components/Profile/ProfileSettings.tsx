import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, User, Mail, Baby, Calendar, Save, Edit2, Trash2, Plus, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

export function ProfileSettings() {
  const { user, parent, signOut, activeChild, setActiveChild } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(parent?.name || '');
  const [email, setEmail] = useState(parent?.email || '');
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDOB, setNewChildDOB] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadChildren();
  }, [user]);

  const loadChildren = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      setChildren(data);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !parent) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('parents')
        .update({ name, email })
        .eq('id', parent.id);

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setEditMode(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = async () => {
    if (!user || !newChildName.trim() || !newChildDOB) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('children')
        .insert({
          parent_id: user.id,
          name: newChildName.trim(),
          date_of_birth: newChildDOB,
        });

      if (error) throw error;

      setMessage('Child added successfully!');
      setNewChildName('');
      setNewChildDOB('');
      setShowAddChild(false);
      loadChildren();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding child:', error);
      setMessage('Failed to add child');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to remove this child profile? This will delete all associated data.')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      setMessage('Child profile removed');
      loadChildren();

      if (activeChild?.id === childId) {
        setActiveChild(null);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting child:', error);
      setMessage('Failed to remove child');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`;
      }
      return `${years}y ${remainingMonths}m old`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl ${
            message.includes('success') || message.includes('added') || message.includes('updated')
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-600">Update your account details</p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-xl border ${
                  editMode
                    ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    : 'border-gray-200 bg-gray-50'
                } transition-all`}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-xl border ${
                  editMode
                    ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    : 'border-gray-200 bg-gray-50'
                } transition-all`}
                placeholder="your@email.com"
              />
            </div>

            {editMode && (
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setName(parent?.name || '');
                    setEmail(parent?.email || '');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Children Profiles</h2>
                <p className="text-sm text-gray-600">Manage your children's accounts</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Child</span>
            </button>
          </div>

          {showAddChild && (
            <div className="mb-6 p-6 bg-pink-50 rounded-2xl border-2 border-pink-200">
              <h3 className="font-bold text-pink-900 mb-4">Add New Child</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Name
                  </label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-pink-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter child's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newChildDOB}
                    onChange={(e) => setNewChildDOB(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-pink-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddChild}
                    disabled={saving || !newChildName.trim() || !newChildDOB}
                    className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Adding...' : 'Add Child'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddChild(false);
                      setNewChildName('');
                      setNewChildDOB('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {children.length === 0 ? (
              <div className="text-center py-12">
                <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No children added yet</p>
                <p className="text-sm text-gray-400 mt-2">Click "Add Child" to get started</p>
              </div>
            ) : (
              children.map((child) => (
                <div
                  key={child.id}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    activeChild?.id === child.id
                      ? 'bg-pink-50 border-pink-500'
                      : 'bg-white border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{child.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{child.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(child.date_of_birth).toLocaleDateString()}</span>
                          <span className="text-pink-600 font-medium">• {calculateAge(child.date_of_birth)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeChild?.id === child.id && (
                        <span className="px-3 py-1 bg-pink-600 text-white text-xs font-bold rounded-full">
                          Active
                        </span>
                      )}
                      {activeChild?.id !== child.id && (
                        <button
                          onClick={() => setActiveChild(child)}
                          className="px-4 py-2 bg-pink-600 text-white text-sm rounded-xl hover:bg-pink-700 transition-colors"
                        >
                          Switch To
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive reminders and tips</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notifications ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Data Privacy</p>
                  <p className="text-sm text-gray-600">Your data is encrypted and secure</p>
                </div>
              </div>
              <a
                href="#"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Support & Help</h2>
              <p className="text-sm text-gray-600">Get assistance and resources</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/resources"
              className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
            >
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700">Research Resources</h3>
              <p className="text-sm text-gray-600">Evidence-based parenting guides</p>
            </a>
            <a
              href="/chat"
              className="p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group"
            >
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-700">AI Parenting Coach</h3>
              <p className="text-sm text-gray-600">Get personalized advice anytime</p>
            </a>
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
          <div className="space-y-3">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
            <p className="text-xs text-gray-500 text-center">
              Signed in as {parent?.email}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
