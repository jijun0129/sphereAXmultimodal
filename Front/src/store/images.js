import { defineStore } from 'pinia';

export const useImagesStore = defineStore('Images', () => {
	const images = ref([]);
	const currentPage = ref(1);
	const totalPages = ref(0);

	const setImages = image => {
		images.value = image;
	};

	const setCurrentPage = current => {
		currentPage.value = current;
	};

	const setTotalPages = total => {
		totalPages.value = total;
		if (total > 10) {
			totalPages.value = 10;
		}
	};

	return {
		images,
		currentPage,
		totalPages,
		setImages,
		setCurrentPage,
		setTotalPages,
	};
});
