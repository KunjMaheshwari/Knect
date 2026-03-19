(function () {
  const STORAGE_KEY = "knect_prod_reminders";
  const VALID_PRIORITIES = ["Low", "Medium", "High"];
  const DEFAULT_FORM = () => ({
    title: "",
    time: "12:00",
    priority: "Medium",
  });
  const DEFAULT_REMINDERS = [
    {
      id: "seed-quarterly-review",
      title: "Quarterly review presentation",
      time: "10:30",
      priority: "High",
      completed: false,
      date: "today",
    },
    {
      id: "seed-architecture-sync",
      title: "Weekly architecture sync",
      time: "13:00",
      priority: "Medium",
      completed: false,
      date: "today",
    },
    {
      id: "seed-design-system-docs",
      title: "Update design system docs",
      time: "17:30",
      priority: "Low",
      completed: false,
      date: "today",
    },
    {
      id: "seed-client-sync",
      title: "Monthly client sync",
      time: "09:00",
      priority: "High",
      completed: false,
      date: "upcoming",
    },
    {
      id: "seed-dev-team-sync",
      title: "Sync with dev team",
      time: "18:00",
      priority: "Low",
      completed: true,
      date: "today",
    },
  ];

  function cloneDefaultReminders() {
    return DEFAULT_REMINDERS.map((reminder) => ({ ...reminder }));
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isValidTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || "").trim());
  }

  function normalizeTime(value) {
    const time = String(value || "").trim();
    return isValidTime(time) ? time : "12:00";
  }

  function normalizePriority(value) {
    const normalizedValue = String(value || "").trim().toLowerCase();
    const match = VALID_PRIORITIES.find(
      (priority) => priority.toLowerCase() === normalizedValue,
    );

    return match || "Medium";
  }

  function inferDateGroup(time) {
    if (!isValidTime(time)) {
      return "today";
    }

    const [hours, minutes] = normalizeTime(time).split(":").map(Number);
    const now = new Date();
    const scheduledMinutes = hours * 60 + minutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return scheduledMinutes > currentMinutes ? "upcoming" : "today";
  }

  function generateUniqueId(existingIds) {
    let id = "";

    do {
      id = `rem-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
    } while (existingIds.has(id));

    existingIds.add(id);
    return id;
  }

  function sanitizeReminder(rawReminder, existingIds) {
    if (!isPlainObject(rawReminder)) {
      return null;
    }

    const title = String(rawReminder.title || "").trim();

    if (!title) {
      return null;
    }

    const time = normalizeTime(rawReminder.time);
    const priority = normalizePriority(rawReminder.priority);
    const completed = Boolean(rawReminder.completed);
    const idCandidate = String(rawReminder.id || "").trim();
    let id = idCandidate;

    if (!id || existingIds.has(id)) {
      id = generateUniqueId(existingIds);
    } else {
      existingIds.add(id);
    }

    const date =
      rawReminder.date === "today" || rawReminder.date === "upcoming"
        ? rawReminder.date
        : inferDateGroup(time);

    return {
      id,
      title,
      time,
      priority,
      completed,
      date,
    };
  }

  function normalizeReminderList(reminders) {
    const existingIds = new Set();

    if (!Array.isArray(reminders)) {
      return [];
    }

    return reminders.reduce((normalized, reminder) => {
      const sanitizedReminder = sanitizeReminder(reminder, existingIds);

      if (sanitizedReminder) {
        normalized.push(sanitizedReminder);
      }

      return normalized;
    }, []);
  }

  function isEditableElement(element) {
    return Boolean(
      element &&
        (element.matches("input, textarea, select") ||
          element.isContentEditable),
    );
  }

  window.reminderApp = function reminderApp() {
    return {
      reminders: [],
      searchQuery: "",
      filter: "all",
      modalOpen: false,
      isEditing: false,
      editingId: null,
      isSaving: false,
      toasts: [],
      form: DEFAULT_FORM(),
      storageReset: false,
      _domEventsBound: false,

      init() {
        this.reminders = this.loadFromLocalStorage();
        this.renderReminders(this.reminders);

        this.$watch("modalOpen", (isOpen) => {
          if (isOpen) {
            this.focusTitleInput();
          }
        });

        this.$nextTick(() => {
          this.bindDomEvents();

          if (this.storageReset) {
            this.showToast("Invalid saved data was reset");
          }
        });
      },

      bindDomEvents() {
        if (this._domEventsBound) {
          return;
        }

        this._domEventsBound = true;

        const searchInput = document.querySelector('[x-model="searchQuery"]');
        const titleInput = document.querySelector('[x-model="form.title"]');

        if (searchInput) {
          searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.searchQuery) {
              event.preventDefault();
              this.searchQuery = "";
            }
          });
        }

        if (titleInput) {
          titleInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && this.modalOpen) {
              event.preventDefault();
              this.saveReminder();
            }
          });
        }

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && this.modalOpen) {
            this.closeModal();
            return;
          }

          if (
            event.key === "/" &&
            !this.modalOpen &&
            !isEditableElement(document.activeElement)
          ) {
            event.preventDefault();
            searchInput?.focus();
          }
        });
      },

      focusTitleInput() {
        this.$nextTick(() => {
          const titleInput = document.querySelector('[x-model="form.title"]');

          if (titleInput) {
            titleInput.focus();
            const end = titleInput.value.length;
            titleInput.setSelectionRange(end, end);
          }
        });
      },

      loadFromLocalStorage() {
        const storedValue = localStorage.getItem(STORAGE_KEY);

        if (storedValue === null) {
          return cloneDefaultReminders();
        }

        try {
          const parsedValue = JSON.parse(storedValue);
          const normalizedReminders = normalizeReminderList(parsedValue);

          if (!Array.isArray(parsedValue)) {
            this.storageReset = true;
            return cloneDefaultReminders();
          }

          if (parsedValue.length > 0 && normalizedReminders.length === 0) {
            this.storageReset = true;
            return cloneDefaultReminders();
          }

          if (parsedValue.length !== normalizedReminders.length) {
            this.storageReset = true;
          }

          return normalizedReminders;
        } catch (_error) {
          this.storageReset = true;
          return cloneDefaultReminders();
        }
      },

      saveToLocalStorage() {
        const normalizedReminders = normalizeReminderList(this.reminders);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedReminders));
          return true;
        } catch (_error) {
          this.showToast("Unable to persist reminders");
          return false;
        }
      },

      renderReminders(reminders = this.reminders) {
        const normalizedReminders = normalizeReminderList(reminders);
        this.reminders = normalizedReminders;
        this.saveToLocalStorage();
        return normalizedReminders;
      },

      get filteredReminders() {
        const query = String(this.searchQuery || "").trim().toLowerCase();

        return this.reminders.filter((reminder) => {
          const matchesFilter =
            this.filter === "completed"
              ? reminder.completed
              : this.filter === "upcoming"
                ? reminder.date === "upcoming"
                : reminder.date === "today";

          if (!matchesFilter) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [reminder.title, reminder.priority, reminder.time].some(
            (value) => String(value).toLowerCase().includes(query),
          );
        });
      },

      get filterTitle() {
        if (this.filter === "upcoming") {
          return "Upcoming Tasks";
        }

        if (this.filter === "completed") {
          return "Completed Tasks";
        }

        return "Today's Agenda";
      },

      showToast(message) {
        const id = `toast-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        this.toasts.push({ id, message });

        window.setTimeout(() => {
          this.toasts = this.toasts.filter((toast) => toast.id !== id);
        }, 3000);
      },

      closeModal() {
        this.modalOpen = false;
        this.isSaving = false;
      },

      openAddModal() {
        this.isEditing = false;
        this.editingId = null;
        this.form = DEFAULT_FORM();
        this.modalOpen = true;
      },

      openEditModal(reminder) {
        const existingReminder = this.reminders.find(
          (item) => item.id === reminder.id,
        );

        if (!existingReminder) {
          this.showToast("Reminder not found");
          return false;
        }

        this.isEditing = true;
        this.editingId = existingReminder.id;
        this.form = {
          title: existingReminder.title,
          time: existingReminder.time,
          priority: existingReminder.priority,
        };
        this.modalOpen = true;
        return true;
      },

      buildReminderPayload(existingReminder = null) {
        const title = String(this.form.title || "").trim();

        if (!title) {
          this.showToast("Task title is required");
          return null;
        }

        const time = normalizeTime(this.form.time);
        const priority = normalizePriority(this.form.priority);

        if (!isValidTime(this.form.time)) {
          this.showToast("Invalid time was reset to 12:00");
        }

        const existingIds = new Set(
          this.reminders
            .filter((reminder) => reminder.id !== existingReminder?.id)
            .map((reminder) => reminder.id),
        );

        const id = existingReminder?.id || generateUniqueId(existingIds);

        return {
          id,
          title,
          time,
          priority,
          completed: existingReminder?.completed || false,
          date: inferDateGroup(time),
        };
      },

      addReminder() {
        if (this.isSaving) {
          return false;
        }

        const newReminder = this.buildReminderPayload();

        if (!newReminder) {
          return false;
        }

        this.isSaving = true;
        this.renderReminders([newReminder, ...this.reminders]);
        this.closeModal();
        this.form = DEFAULT_FORM();
        this.showToast("New task added");
        return true;
      },

      editReminder() {
        if (this.isSaving || !this.editingId) {
          return false;
        }

        const existingReminder = this.reminders.find(
          (reminder) => reminder.id === this.editingId,
        );

        if (!existingReminder) {
          this.showToast("Reminder not found");
          this.closeModal();
          return false;
        }

        const updatedReminder = this.buildReminderPayload(existingReminder);

        if (!updatedReminder) {
          return false;
        }

        this.isSaving = true;
        this.renderReminders(
          this.reminders.map((reminder) =>
            reminder.id === this.editingId ? updatedReminder : reminder,
          ),
        );
        this.closeModal();
        this.showToast("Changes saved");
        return true;
      },

      saveReminder() {
        return this.isEditing ? this.editReminder() : this.addReminder();
      },

      deleteReminder(id) {
        const nextReminders = this.reminders.filter(
          (reminder) => reminder.id !== id,
        );

        if (nextReminders.length === this.reminders.length) {
          this.showToast("Reminder not found");
          return false;
        }

        this.renderReminders(nextReminders);

        if (this.editingId === id) {
          this.isEditing = false;
          this.editingId = null;
          this.form = DEFAULT_FORM();
          this.closeModal();
        }

        this.showToast("Reminder removed");
        return true;
      },

      toggleComplete(id) {
        let updatedReminder = null;

        const nextReminders = this.reminders.map((reminder) => {
          if (reminder.id !== id) {
            return reminder;
          }

          updatedReminder = {
            ...reminder,
            completed: !reminder.completed,
          };

          return updatedReminder;
        });

        if (!updatedReminder) {
          this.showToast("Reminder not found");
          return false;
        }

        this.renderReminders(nextReminders);
        this.showToast(
          updatedReminder.completed
            ? "Task marked as complete"
            : "Task marked as active",
        );
        return true;
      },
    };
  };
})();
