export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const playNotificationSound = () => {
    const audio = new Audio('/audio/notification.mp3');
    audio.play().catch((err) => {
      console.warn('Failed to play notification sound $>>', err);
    });
  };