/* global $, t, Gallery, marked */
(function () {
	var InfoBox = function () {
		this.infoContentElement = $('.album-info-content');
	};

	InfoBox.prototype = {
		infoContentElement: null,
		albumInfo: null,

		/**
		 * Shows an information box to the user
		 */
		showInfo: function () {
			if (this.infoContentElement.is(':visible')) {
				this.infoContentElement.slideUp();
			} else {
				this.albumInfo = Gallery.albumConfig.getAlbumInfo();

				if (!this.albumInfo.infoLoaded) {
					this.infoContentElement.addClass('icon-loading');
					this.infoContentElement.empty();
					this.infoContentElement.height(100);
					this.infoContentElement.slideDown();
					if (!$.isEmptyObject(this.albumInfo.descriptionLink)) {
						var path = '/' + this.albumInfo.filePath;
						var file = this.albumInfo.descriptionLink;
						var descriptionUrl = Gallery.buildFilesUrl(path, file);
						var thisInfoBox = this;
						$.get(descriptionUrl).done(function (data) {
								thisInfoBox._addContent(data);
							}
						).fail(function () {
								thisInfoBox._addContent(t('gallery',
									'Could not load the description'));
							});
					} else {
						this._addContent(this.albumInfo.description);
					}
					Gallery.albumConfig.setInfoLoaded();
				} else {
					this.infoContentElement.slideDown();
				}
				this.infoContentElement.scrollTop(0);
			}
		},

		/**
		 * Adds our album information to the infoBox
		 *
		 * @param {string} content
		 * @private
		 */
		_addContent: function (content) {
			try {
				content = marked(content);
			} catch (exception) {
				content = t('gallery',
					'Could not load the description: ' + exception.message);
			}
			this.infoContentElement.append(content);
			this.infoContentElement.find('a').attr("target", "_blank");
			this._showCopyright();
			this._adjustHeight();
		},

		/**
		 * Adjusts the height of the element to match the content
		 * @private
		 */
		_adjustHeight: function () {
			this.infoContentElement.removeClass('icon-loading');
			var newHeight = this.infoContentElement[0].scrollHeight;
			this.infoContentElement.animate({
				height: newHeight + 40
			}, 500);
			this.infoContentElement.scrollTop(0);
		},

		/**
		 * Adds copyright information to the information box
		 * @private
		 */
		_showCopyright: function () {
			if (!$.isEmptyObject(this.albumInfo.copyright) ||
				!$.isEmptyObject(this.albumInfo.copyrightLink)) {
				var copyright;
				var copyrightTitle = $('<h4/>');
				copyrightTitle.append(t('gallery', 'Copyright'));
				this.infoContentElement.append(copyrightTitle);

				if (!$.isEmptyObject(this.albumInfo.copyright)) {
					try {
						copyright = marked(this.albumInfo.copyright);
					} catch (exception) {
						copyright =
							t('gallery',
								'Could not load the copyright notice: ' + exception.message);
					}
				} else {
					copyright = '<p>' + t('gallery', 'Copyright notice') + '</p>';
				}

				if (!$.isEmptyObject(this.albumInfo.copyrightLink)) {
					this._addCopyrightLink(copyright);
				} else {
					this.infoContentElement.append(copyright);
				}
			}
		},

		/**
		 * Adds a link to a copyright document
		 *
		 * @param {string} copyright
		 * @private
		 */
		_addCopyrightLink: function (copyright) {
			var path = '/' + this.albumInfo.filePath;
			var file = this.albumInfo.copyrightLink;
			var copyrightUrl = Gallery.buildFilesUrl(path, file);
			var copyrightElement = $(copyright);
			copyrightElement.find('a').removeAttr("href");
			copyright = copyrightElement.html();
			var copyrightLink = $('<a>', {
				html: copyright,
				title: t('gallery', 'Link to copyright document'),
				href: copyrightUrl,
				target: "_blank"
			});
			this.infoContentElement.append(copyrightLink);
		}
	};

	Gallery.InfoBox = InfoBox;
})();