$(function() {
	var elementWrapper = $('#element-wrapper');
	var elementId = elementWrapper.data('element-id');
	var editButton = $('#edit-element');
	var deleteButton = $('#delete-element');
	var unauthorizedMsg = $('#unauthorized-msg');
	
	pageLoad();

	function pageLoad() {

		deleteButton.on('click', function() {
			$.ajax({
				method: 'DELETE',
				url: '/users-template/api/public',
				contentType: 'application/json',
				data: JSON.stringify({
					id: elementId
				})
			})
			.then(function (element) {
				document.location.href = '/users-template/public/';
			})
			.fail(window.application.ajaxFailHandler);
		});

		window.application.authentication.subscribe(function(user) {
			elementWrapper.addClass('hidden');
			editButton.addClass('hidden');
			deleteButton.addClass('hidden');
			unauthorizedMsg.addClass('hidden');

			if (user) {
				if (window.application.userHasPermission(user, 'public:view')) {
					$.ajax({
						method: 'GET',
						url: '/users-template/api/public/getById',
						dataType: 'json',
						data: {
							id: elementWrapper.data('element-id')
						}
					})
					.then(function (element) {
						elementWrapper.html(element.name);
						elementWrapper.removeClass('hidden');
					})
					.fail(window.application.ajaxFailHandler);
				}

				if (window.application.userHasPermission(user, 'public:edit')) {
					editButton.removeClass('hidden');
				}

				if (window.application.userHasPermission(user, 'public:delete')) {
					deleteButton.removeClass('hidden');
				}
			}
			else {
				unauthorizedMsg.removeClass('hidden');
			}
		});
		window.application.authentication.pageLoad(['public:view', 'public:edit', 'public:delete']);
	}
});