import { useState, useEffect, useCallback } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Calendar, ChevronLeft, ChevronRight, Plus,
  Loader2, Clock, MapPin, Users, Trash2,
  X, CheckCircle, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2'];

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const CalendarTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', start: '', end: '',
    isAllDay: false, color: '#2563eb',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = useCallback(async () => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    try {
      const res = await API.get('/calendar/events', { params: { start: start.toISOString(), end: end.toISOString() } });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getEventsForDay = (day) => {
    const dateStr = new Date(year, month, day).toDateString();
    return events.filter((e) => new Date(e.start).toDateString() === dateStr || new Date(e.end).toDateString() === dateStr);
  };

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setSelectedEvent(null);
    setFormData({
      title: '', description: '', location: '', start: `${date.toISOString().split('T')[0]}T09:00`, end: `${date.toISOString().split('T')[0]}T10:00`,
      isAllDay: false, color: '#2563eb',
    });
    setShowForm(true);
  };

  const handleEventClick = (e) => {
    setSelectedEvent(e);
    setSelectedDate(new Date(e.start));
    setFormData({
      title: e.title, description: e.description || '', location: e.location || '',
      start: e.start ? new Date(e.start).toISOString().slice(0, 16) : '',
      end: e.end ? new Date(e.end).toISOString().slice(0, 16) : '',
      isAllDay: e.isAllDay || false, color: e.color || '#2563eb',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await API.put(`/calendar/events/${selectedEvent._id}`, formData);
        toast.success('Event updated');
      } else {
        await API.post('/calendar/events', formData);
        toast.success('Event created');
      }
      setShowForm(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/calendar/events/${selectedEvent._id}`);
      toast.success('Event deleted');
      setShowForm(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-blue animate-spin" /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
            <h2 className="text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h2>
            <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
            <Button variant="outline" size="sm" onClick={handleToday} className="rounded-xl text-xs">Today</Button>
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] lg:min-h-[120px] border-b border-r border-gray-50 bg-gray-50/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              return (
                <button key={day} onClick={() => handleDayClick(day)}
                  className={`min-h-[100px] lg:min-h-[120px] border-b border-r border-gray-50 p-1.5 text-left hover:bg-gray-50 transition-colors ${isToday ? 'bg-brand-blue/5' : ''}`}>
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-medium rounded-full ${isToday ? 'bg-brand-blue text-white' : 'text-gray-700'}`}>{day}</span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev._id} onClick={(e) => { e.stopPropagation(); handleEventClick(ev); }}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer"
                        style={{ backgroundColor: ev.color || '#2563eb' }}>
                        {!ev.isAllDay && formatTime(ev.start)} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1.5">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {selectedDate && !showForm && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              <Button variant="blue" size="sm" onClick={() => { setSelectedEvent(null); setFormData({ title: '', description: '', location: '', start: `${selectedDate.toISOString().split('T')[0]}T09:00`, end: `${selectedDate.toISOString().split('T')[0]}T10:00`, isAllDay: false, color: '#2563eb' }); setShowForm(true); }}>
                <Plus size={12} className="mr-1" /> Add Event
              </Button>
            </div>
            {getEventsForDay(selectedDate.getDate()).length === 0 ? (
              <p className="text-sm text-gray-400">No events for this day</p>
            ) : getEventsForDay(selectedDate.getDate()).map((ev) => (
              <button key={ev._id} onClick={() => handleEventClick(ev)}
                className="w-full text-left p-3 rounded-xl mb-2 hover:bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                    <p className="text-xs text-gray-500">
                      {ev.isAllDay ? 'All day' : `${formatTime(ev.start)} - ${formatTime(ev.end)}`}
                      {ev.location ? ` at ${ev.location}` : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="w-full lg:w-96 flex-shrink-0">
          <Card className="border border-gray-100 shadow-sm sticky top-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{selectedEvent ? 'Edit Event' : 'New Event'}</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setSelectedEvent(null); }}>
                  <X size={16} />
                </Button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required className="h-9 rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} className="rounded-xl" /></div>
                <div className="space-y-1"><Label className="text-xs">Location</Label><Input value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} className="h-9 rounded-xl" /></div>
                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-xs">Start</Label><Input type="datetime-local" value={formData.start} onChange={(e) => setFormData((p) => ({ ...p, start: e.target.value }))} required className="h-9 rounded-xl text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">End</Label><Input type="datetime-local" value={formData.end} onChange={(e) => setFormData((p) => ({ ...p, end: e.target.value }))} required className="h-9 rounded-xl text-xs" /></div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isAllDay" checked={formData.isAllDay} onChange={(e) => setFormData((p) => ({ ...p, isAllDay: e.target.checked }))} className="rounded" />
                  <Label htmlFor="isAllDay" className="text-xs">All day event</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-1.5">
                    {COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setFormData((p) => ({ ...p, color: c }))}
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${formData.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}>
                        {formData.color === c && <CheckCircle size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="blue" size="sm" className="rounded-xl flex-1">
                    {selectedEvent ? 'Update' : 'Create'}
                  </Button>
                  {selectedEvent && (
                    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} className="rounded-xl">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;
