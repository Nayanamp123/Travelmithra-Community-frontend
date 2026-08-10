import { useEffect, useState, useRef } from 'react';
import { profileAPI } from '../api/client';

type CommunityMember = {
  id?: number;
  name: string;
  email?: string;
  role?: string;
  joined?: string;
  referral_code?: string;
  referred_by_name?: string;
};

type CommunityProps = {
  currentUser: { id?: number; name: string; email: string; avatar?: string; role?: string } | null;
};

const featuredStories = [
  {
    title: 'Vietnam Highlands Adventure',
    location: 'Vietnam',
    image:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Thailand Island Escape',
    location: 'Thailand',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Penang Heritage Trail',
    location: 'Malaysia',
    image:
      'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=900&q=80',
  },
];

export default function Community({ currentUser }: CommunityProps) {
  const storiesRef = useRef<HTMLElement | null>(null);
  const [showStories, setShowStories] = useState(false);

  useEffect(() => {
    if (showStories && storiesRef.current) {
      storiesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showStories]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState('');
  const [managing, setManaging] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const sortedMembers = [...members].sort((firstMember, secondMember) =>
    firstMember.name.localeCompare(secondMember.name, undefined, { sensitivity: 'base' })
  );
  const isSuperAdmin = currentUser?.role === 'superadmin';

  useEffect(() => {
    let isActive = true;

    profileAPI
      .getAllUsers()
      .then((registeredUsers: CommunityMember[]) => {
        if (!isActive) {
          return;
        }

        // normalize possible missing fields
        const normalized = registeredUsers.map((u) => ({
          ...u,
          email: (u as any).email,
          role: (u as any).role,
          joined: (u as any).joined || (u as any).createdAt,
          referral_code: (u as any).referral_code,
          referred_by_name: (u as any).referred_by_name,
        }));

        setMembers(normalized);
        setMembersError('');
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setMembersError(error instanceof Error ? error.message : 'Failed to load registered users');
      })
      .finally(() => {
        if (isActive) {
          setLoadingMembers(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const exportCSV = () => {
    if (members.length === 0) return;
    const headers = ['id', 'name', 'email', 'role', 'referred_by', 'referral_code', 'joined'];
    const rows = members.map((m) => [
      m.id ?? '',
      m.name,
      m.email ?? '',
      m.role ?? '',
      m.referred_by_name ?? '—',
      m.referral_code ?? '—',
      m.joined ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'community_members.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRole = async (userId?: number, role?: string) => {
    if (!userId || !role) return;
    try {
      await profileAPI.updateUserRole(userId, role);
      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)));
      setActionMessage('Role updated');
      setTimeout(() => setActionMessage(''), 2500);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to update role');
      setTimeout(() => setActionMessage(''), 2500);
    }
  };

  const removeUser = async (userId?: number) => {
    if (!userId) return;
    if (!confirm('Delete this user? This action is irreversible.')) return;
    try {
      await profileAPI.deleteUser(userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      setActionMessage('User deleted');
      setTimeout(() => setActionMessage(''), 2500);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to delete user');
      setTimeout(() => setActionMessage(''), 2500);
    }
  };

  return (
    <section className="page-section" id="community">
      <div className="page-header">
        <h2>Community</h2>
        <p>Connect with fellow travelers and share your holiday experiences</p>
      </div>

      <div className="card community-members-card">
        <h3>Community Members</h3>

        {loadingMembers && <p>Loading registered users...</p>}
        {membersError && <div className="error-message">{membersError}</div>}
        {isSuperAdmin && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="primary-btn" onClick={() => setManaging((m) => !m)}>
              {managing ? 'Close Manager' : 'Manage Members'}
            </button>
            <button className="primary-btn" onClick={exportCSV}>
              Export CSV
            </button>
            {actionMessage && <span style={{ marginLeft: 8 }}>{actionMessage}</span>}
          </div>
        )}

        {!loadingMembers && !membersError && (
            <div className="community-members-table-wrap">
              {sortedMembers.length > 0 ? (
                <table className="community-members-table">
                  <thead>
                    <tr>
                      <th scope="col">No.</th>
                      <th scope="col">Name</th>
                      {isSuperAdmin && <th scope="col">Email</th>}
                      {isSuperAdmin && <th scope="col">Role</th>}
                      {isSuperAdmin && <th scope="col">Referred by</th>}
                      {isSuperAdmin && <th scope="col">Invite Code</th>}
                      {isSuperAdmin && <th scope="col">Joined</th>}
                      {managing && isSuperAdmin && <th scope="col">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMembers.map((member, index) => (
                      <tr key={member.id ?? `${member.name}-${index}`}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{member.name}</strong>
                        </td>
                        {isSuperAdmin && <td>{member.email ?? '-'}</td>}
                        {isSuperAdmin && <td>{member.role ?? 'member'}</td>}
                        {isSuperAdmin && <td>{member.referred_by_name ?? '-'}</td>}
                        {isSuperAdmin && <td>{member.referral_code ?? '-'}</td>}
                        {isSuperAdmin && <td>{member.joined ?? '-'}</td>}
                        {managing && isSuperAdmin && (
                          <td>
                            <select
                              value={member.role ?? 'member'}
                              onChange={(e) => updateRole(member.id, e.target.value)}
                            >
                              <option value="member">member</option>
                              <option value="moderator">moderator</option>
                              <option value="superadmin">superadmin</option>
                            </select>
                            <button
                              style={{ marginLeft: 8 }}
                              onClick={() => removeUser(member.id)}
                              className="secondary-btn"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No registered users found.</p>
              )}
            </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Travel Stories</h3>
          <p>Share and discover travel stories from our community members around the world.</p>
          <button
            className="primary-btn"
            onClick={() => setShowStories((s) => !s)}
            aria-expanded={showStories}
          >
            {showStories ? 'Hide Stories' : 'Explore Stories'}
          </button>
        </div>

        <div className="card">
          <h3>Destination Tips</h3>
          <p>Get insider tips and recommendations from travelers who have been there.</p>
          <button className="primary-btn">Browse Tips</button>
        </div>

        <div className="card">
          <h3>Travel Groups</h3>
          <p>Join groups based on destinations, interests, or travel styles.</p>
          <button className="primary-btn">Find Groups</button>
        </div>

        <div className="card">
          <h3>Events</h3>
          <p>Participate in meetups and events organized by our community.</p>
          <button className="primary-btn">View Events</button>
        </div>
      </div>

      {showStories && (
        <section className="previous-trips-section" ref={(el) => (storiesRef.current = el)}>
          <div className="section-heading">
            <h3>Featured Travel Stories</h3>
            <p>Explore recent community highlights from Vietnam, Thailand, and Malaysia.</p>
          </div>

          <div className="trip-gallery">
            {featuredStories.map((story) => (
              <article className="trip-photo-card" key={story.title}>
                <img src={story.image} alt={`${story.title} in ${story.location}`} />
                <div>
                  <h4>{story.title}</h4>
                  <p>{story.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
