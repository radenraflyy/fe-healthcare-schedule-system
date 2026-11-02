import { useEffect, useRef } from 'react';

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { type Notification, type Page, api } from '../../data-services/api';
import { isNotificationUnread } from '../../data-services/appointment-rules';
import { formatDateTime, formatDateTimesInText } from '../../utils/date-time';

const NOTIFICATION_QUERY_KEY = ['notifications', 'list'];
const NOTIFICATIONS_PER_PAGE = 5;

export default function NotificationsView({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const scrollContainer = useRef<HTMLDivElement>(null);
  const loadMoreMarker = useRef<HTMLDivElement>(null);
  const notifications = useInfiniteQuery({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: ({ pageParam }) => api.notifications(pageParam, NOTIFICATIONS_PER_PAGE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.notifications.page < lastPage.notifications.totalPages
        ? lastPage.notifications.page + 1
        : undefined,
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
  useEffect(() => {
    const root = scrollContainer.current;
    const target = loadMoreMarker.current;
    if (!root || !target || !notifications.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !notifications.isFetchingNextPage) {
          void notifications.fetchNextPage();
        }
      },
      { root, rootMargin: '80px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [notifications.fetchNextPage, notifications.hasNextPage, notifications.isFetchingNextPage]);
  const markRead = useMutation({
    mutationFn: api.markRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      const previous =
        queryClient.getQueryData<InfiniteData<{ notifications: Page<Notification> }>>(
          NOTIFICATION_QUERY_KEY,
        );
      queryClient.setQueryData<InfiniteData<{ notifications: Page<Notification> }> | undefined>(
        NOTIFICATION_QUERY_KEY,
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  notifications: {
                    ...page.notifications,
                    items: page.notifications.items.map((item) =>
                      item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
                    ),
                  },
                })),
              }
            : old,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(NOTIFICATION_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const items = notifications.data?.pages.flatMap((page) => page.notifications.items) ?? [];
  return (
    <section
      role='dialog'
      aria-modal='false'
      aria-labelledby='notification-panel-title'
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      className='absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'
    >
      <header className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
        <div>
          <h2 id='notification-panel-title' className='text-sm font-bold text-slate-800'>
            Notifikasi
          </h2>
          <p className='mt-0.5 text-[11px] text-slate-500'>Pembaruan janji temu dan pengingat.</p>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Tutup notifikasi'
          className='rounded-lg px-2 py-1 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700'
        >
          ×
        </button>
      </header>
      <div ref={scrollContainer} className='max-h-[min(65vh,32rem)] overflow-y-auto p-3'>
        {notifications.isLoading ? (
          <p role='status' className='p-6 text-center text-sm text-slate-500'>
            Memuat notifikasi…
          </p>
        ) : notifications.error && !items.length ? (
          <p role='alert' className='rounded-xl bg-rose-50 p-4 text-sm text-rose-700'>
            {notifications.error.message}
          </p>
        ) : !items.length ? (
          <div className='px-4 py-8 text-center'>
            <h3 className='text-sm font-semibold text-slate-800'>Belum ada notifikasi</h3>
            <p className='mt-1 text-xs text-slate-500'>
              Pembaruan janji temu dan pengingat akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {notifications.error && (
              <p role='alert' className='rounded-xl bg-rose-50 p-3 text-xs text-rose-700'>
                {notifications.error.message}
              </p>
            )}
            {markRead.error && (
              <p role='alert' className='rounded-xl bg-rose-50 p-3 text-xs text-rose-700'>
                Gagal menandai notifikasi sebagai dibaca: {markRead.error.message}
              </p>
            )}
            {items.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                busy={markRead.isPending}
                onRead={() => markRead.mutate(item.id)}
              />
            ))}
            <div ref={loadMoreMarker} aria-hidden='true' />
            {notifications.isFetchingNextPage && (
              <p role='status' className='py-3 text-center text-xs text-slate-500'>
                Memuat notifikasi berikutnya…
              </p>
            )}
            {notifications.isFetchNextPageError && (
              <button
                type='button'
                onClick={() => void notifications.fetchNextPage()}
                className='w-full py-3 text-center text-xs font-semibold text-rata-red'
              >
                Coba muat notifikasi lagi
              </button>
            )}
          </div>
        )}
      </div>
    </section>
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
      className={`rounded-xl border bg-white p-3 ${unread ? 'border-rose-200' : 'border-slate-200/80'}`}
    >
      <div className='flex items-start gap-3'>
        <span
          className={`mt-1 size-2.5 shrink-0 rounded-full ${unread ? 'bg-rata-red' : 'bg-slate-300'}`}
        />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-col justify-between gap-2 sm:flex-row'>
            <h3 className='text-xs font-bold text-slate-800'>{item.title}</h3>
            <span className='text-[10px] text-slate-400'>{formatDateTime(item.createdAt)}</span>
          </div>
          <p className='mt-1 text-xs leading-5 text-slate-600'>
            {formatDateTimesInText(item.message)}
          </p>
          <div className='mt-3 flex items-center justify-between'>
            <span
              className={`text-[10px] font-medium ${unread ? 'text-rata-red' : 'text-slate-400'}`}
            >
              {unread ? 'Belum dibaca' : `Dibaca ${formatDateTime(item.readAt!)}`}
            </span>
            {unread && (
              <button
                disabled={busy}
                onClick={onRead}
                className='text-[10px] font-semibold text-rata-red disabled:opacity-50'
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
