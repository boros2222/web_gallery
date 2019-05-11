function makeRequest (method, url) {
	return new Promise(function (resolve, reject) {

		let xhr = new XMLHttpRequest();
		xhr.open(method, url);

		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};

		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};

		xhr.send();
	});
}

let pictures = [];

makeRequest("GET", "/get/image/all")
.then(response => {
 
    return new Promise(function(resolve, reject) {
		pictures = JSON.parse(response).items;
	
		let picturePromises = [];
		pictures.forEach(picture => {
			picturePromises.push(
				makeRequest("GET", "/get/image/" + picture)
				.then(response => {
					setupPicture(response, picture);
				})
				.catch(err => {
					console.log(err.statusText);
				})
			);
		});
 
        Promise.all(picturePromises).then(resolve)
    });
})
.then(() => {
	setupResponsivePictureArrangement();
})
.catch(err => {
	console.log(err.statusText);
})

document.querySelector("div.picture-view-bg").addEventListener("click", function() {
	if (!event.target.matches("img.picture-view")) {
		document.querySelector("body").style.overflow = "visible";
		this.style.display = "none";
		document.querySelector("div.lds-roller").style.display = "inline-block";
		document.querySelector("img.picture-view").src = "";
		document.querySelector("img.picture-view").style.display = "none";
	}
});

function setupResponsivePictureArrangement() {
	adaptPicturesToScreen();

	window.onresize = function(event) {
		adaptPicturesToScreen();
	};
}

function adaptPicturesToScreen() {
	let normalScreen = window.matchMedia("only screen and (min-width: 1024px)");
	let middleScreen = window.matchMedia("only screen and (min-width: 768px) and (max-width: 1024px)");
	let smallScreen = window.matchMedia("only screen and (max-width: 768px)");

	if(normalScreen.matches)
		arrangePictures(3);
	else if(middleScreen.matches)
		arrangePictures(2);
	else if(smallScreen.matches)
		arrangePictures(1);
}

function arrangePictures(numberOfColumns) {
	let pictures = document.querySelectorAll("div.pictures img");
	for(let i = 0; i < pictures.length; i++) {
		pictures[i].style.position = "relative";

		if(i > numberOfColumns-1) {
			current = pictures[i];
			above = pictures[i-numberOfColumns];
			current.style.top = 0;
			let offset = -(current.offsetTop - (above.offsetTop + above.height) - 50); // 50 is margin
			current.style.top = offset;
		}
	}
}

function setupPicture(response, picture) {
	let wrapper = document.createElement("div");
	wrapper.innerHTML = '<img src="data:image/jpeg;base64, ' + response + '" />';
	let img = wrapper.firstChild;

	img.addEventListener("click", function() {
		let body = document.querySelector("body");
		body.style.overflow = "hidden";

		let image = new Image;
		image.onload = function() {
			document.querySelector("div.lds-roller").style.display = "none";
			document.querySelector("img.picture-view").src = this.src;
			document.querySelector("img.picture-view").style.display = "block";
		};
		image.src = "photos/" + picture;

		document.querySelector("div.picture-view-bg").style.top = body.scrollTop;
		document.querySelector("div.picture-view-bg").style.left = body.scrollLeft;
		document.querySelector("div.picture-view-bg").style.display = "flex";
	});

	document.querySelector("div.pictures").appendChild(img);
}