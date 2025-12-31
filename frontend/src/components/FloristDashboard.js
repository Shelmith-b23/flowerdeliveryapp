const toggleAvailability = async () => {
  try {
    const newStatus = !profile.available;
    await api.put(`/florists/${user.id}`, { available: newStatus });
    setProfile(prev => ({ ...prev, available: newStatus }));
  } catch (err) {
    alert("Failed to update availability");
  }
};

const updateProfile = async () => {
  try {
    await api.put(`/florists/${user.id}`, profile);
    alert("Profile updated");
  } catch (err) {
    alert("Failed to update profile");
  }
};
          