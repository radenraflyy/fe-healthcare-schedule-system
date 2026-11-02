import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PageHeading } from '../../components/PageHeading';
import { type Notification, api } from '../../data-services/api';
import { isNotificationUnread } from '../../data-services/appointment-rules';

function formattedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
export default function NotificationsView() {
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications,
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
  const markRead = useMutation({
    mutationFn: api.markRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<{ notifications: { items: Notification[] } }>([
        'notifications',
      ]);
      queryClient.setQueryData(['notifications'], (old: typeof previous) =>
        old
          ? {
              notifications: {
                ...old.notifications,
                items: old.notifications.items.map((item) =>
                  item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
                ),
              },
            }
          : old,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['notifications'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  return (
    <>
      <PageHeading
        eyebrow='Pembaruan'
        title='Notifikasi'
        description='Pembaruan status janji temu dan pengingat untuk akun Anda.'
      />
      {notifications.isLoading ? (
        <p role='status' className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          Memuat notifikasi…
        </p>
      ) : notifications.error ? (
        <p role='alert' className='rounded-2xl bg-white p-8 text-center text-sm text-rose-700'>
          {notifications.error.message}
        </p>
      ) : !notifications.data?.notifications.items.length ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center'>
          <h2 className='font-semibold text-slate-800'>Belum ada notifikasi</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Pembaruan janji temu dan pengingat akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications.data.notifications.items.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              busy={markRead.isPending}
              onRead={() => markRead.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
function NotificationCard({
  item,
  busy,
  onRead,
}: {
  item: Notification;
  busy: boolean;
  onRead: () => void;
}) {
  const unread = isNotificationUnread(item.readAt);
  return (
    <article
      className={`rounded-2xl border bg-white p-5 ${unread ? 'border-rose-200 shadow-sm' : 'border-slate-200/80'}`}
    >
      <div className='flex items-start gap-3'>
        <span
          className={`mt-1 size-2.5 shrink-0 rounded-full ${unread ? 'bg-rata-red' : 'bg-slate-300'}`}
        />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-col justify-between gap-2 sm:flex-row'>
            <h2 className='text-sm font-bold text-slate-800'>{item.title}</h2>
            <span className='text-xs text-slate-400'>{formattedDate(item.createdAt)}</span>
          </div>
          <p className='mt-1 text-sm leading-6 text-slate-600'>{item.message}</p>
          <div className='mt-3 flex items-center justify-between'>
            <span className={`text-xs font-medium ${unread ? 'text-rata-red' : 'text-slate-400'}`}>
              {unread ? 'Belum dibaca' : `Dibaca ${formattedDate(item.readAt!)}`}
            </span>
            {unread && (
              <button
                disabled={busy}
                onClick={onRead}
                className='text-xs font-semibold text-rata-red disabled:opacity-50'
              >
                Tandai sudah dibaca
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
