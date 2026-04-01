import { Network } from '@capacitor/network';
import { ref, onMounted, onUnmounted } from 'vue';

export const useNetwork = () => {
  const isConnected = ref(true);
  const connectionType = ref('unknown');
  let networkListener = null;

  const updateStatus = async () => {
    try {
      const status = await Network.getStatus();
      isConnected.value = status.connected;
      connectionType.value = status.connectionType;
    } catch (e) {
      console.error("Network plugin not available", e);
    }
  };

  onMounted(async () => {
    // Only run on client (important for Nuxt)
    if (process.client) {
      await updateStatus();

      networkListener = await Network.addListener('networkStatusChange', (status) => {
        isConnected.value = status.connected;
        connectionType.value = status.connectionType;
      });
    }
  });

  onUnmounted(() => {
    if (networkListener) {
      networkListener.remove();
    }
  });

  return { isConnected, connectionType, updateStatus };
};