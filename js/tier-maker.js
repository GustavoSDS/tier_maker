// TODO: GUARDAR EN LOCALSTORAGE Y RECUPERAR TODO LO QUE EL USUARIO HA HECHO
// TODO: PODER CARGAR UN JSON Y PONERLO EN EL TIER
// TODO: TENER TIERLIST YA LISTOS (MAS POPULARES) Y PONERLOS COMO OPCIONES

// TODO: HACER UN BACKEND PARA PODER GUARDAR TODO LO QUE EL USUARIO HA HECHO

const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const $imageInput = $("#image-input");
const $itemsSection = $("#selector-items");
const $addImageButton = $("#add-image-button");
const $resetButton = $("#reset-button");
const $saveButton = $("#save-button");
const $rows = $$(".tier .row");

let draggedElement = null;
let sourceContainer = null;

// Event listeners
$imageInput.addEventListener("change", async (e) => {
	const { files } = e.target;
	useFilesToCreateItems(files);
});

$rows.forEach((row) => {
	row.addEventListener("dragover", handleDragOver);
	row.addEventListener("drop", handleDrop);
	row.addEventListener("dragleave", handleDragLeave);
});

$itemsSection.addEventListener("dragover", handleDragOver);
$itemsSection.addEventListener("drop", handleDrop);
$itemsSection.addEventListener("dragleave", handleDragLeave);

$itemsSection.addEventListener("drop", handleDropFromDesktop);
$itemsSection.addEventListener("dragover", handleDragOverFromDesktop);

$resetButton.addEventListener("click", () => {
	const items = $$(".tier .item-image");
	items.forEach((item) => {
		item.remove();
		$itemsSection.appendChild(item);
	});
});

$saveButton.addEventListener("click", () => {
	const tierContainer = $(".tier");
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	import(
		'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm'
	).then(({ default: html2canvas }) => {
        html2canvas(tierContainer).then((canvas) => {
            ctx.drawImage(canvas, 0, 0);
            const imageURL = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = "tier.png";
            downloadLink.href = imageURL;
            downloadLink.click();
        });
    });
});

// Functions
function handleDragStart(event) {
	console.log("drag start");
	draggedElement = event.target;
	sourceContainer = draggedElement.parentNode;
	event.dataTransfer.setData("text/plain", draggedElement.src);
}

function handleDragEnd() {
	console.log("drag end");
	draggedElement = null;
	sourceContainer = null;
}

function handleDrop(event) {
	event.preventDefault();
	const { currentTarget, dataTransfer } = event;

	if (!draggedElement) return;

	if (currentTarget === sourceContainer) {
		currentTarget.classList.remove("drag-over");
		return;
	}

	if (draggedElement && sourceContainer) {
		sourceContainer.removeChild(draggedElement);
	}

	const src = dataTransfer.getData("text/plain");
	const imgElement = createItem(src);
	currentTarget.appendChild(imgElement);

	currentTarget.classList.remove("drag-over");
	currentTarget.querySelector(".drag-preview")?.remove();
}

function handleDragOver(event) {
	event.preventDefault();
	const { currentTarget, dataTransfer } = event;

	currentTarget.classList.add("drag-over");
	if (sourceContainer === currentTarget) return;

	const dragPreview = $(".drag-preview");

	if (draggedElement && !dragPreview) {
		const previewElement = draggedElement.cloneNode(true);
		previewElement.classList.add("drag-preview");
		currentTarget.appendChild(previewElement);
	}
}

function handleDragLeave(event) {
	event.preventDefault();
	event.currentTarget.classList.remove("drag-over");
	event.currentTarget.querySelector(".drag-preview")?.remove();
}

function handleDragOverFromDesktop(event) {
	event.preventDefault();
	const { currentTarget, dataTransfer } = event;

	if (
		dataTransfer.types.includes("Files") &&
		!dataTransfer.types.includes("text/plain")
	) {
		currentTarget.classList.add("drag-files");
	}
}

function handleDropFromDesktop(event) {
	event.preventDefault();
	const { currentTarget, dataTransfer } = event;

	if (
		dataTransfer.types.includes("Files") &&
		!dataTransfer.types.includes("text/plain")
	) {
		currentTarget.classList.remove("drag-files");
		const { files } = dataTransfer;
		const allImages = Array.from(files).every((file) =>
			file.type.startsWith("image/")
		);

		if (allImages) {
			useFilesToCreateItems(files);
		} else return;
	}
}

function useFilesToCreateItems(files) {
	if (files && files.length > 0) {
		Array.from(files).forEach(async (file) => {
			const reader = new FileReader();
			reader.onload = async (eventReader) => {
				createItem(eventReader.target.result);
			};
			reader.readAsDataURL(file);
		});
	}
}

function createItem(src) {
	const imgElement = document.createElement("img");
	imgElement.draggable = true;
	imgElement.src = src;
	imgElement.className = "item-image";

	imgElement.addEventListener("dragstart", handleDragStart);
	imgElement.addEventListener("dragend", handleDragEnd);

	$itemsSection.appendChild(imgElement);

	return imgElement;
}
