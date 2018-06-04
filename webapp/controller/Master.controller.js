sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageToast, MessageBox, JSONModel, ODataModel, BusyIndicator) {
	"use strict";

	return Controller.extend("Press_Shop_Fiori3.controller.Master", {

		onInit: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='05')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				var Open = response.Open;
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setValue(site);
				if (Open === "X") {
					oController.GetData();
				}
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		getContextByIndexn: function(oEvent) {
			var self = this;
			var promise = $.Deferred();
			var selectedGroup = oEvent.getSource().getBindingContext("itemModel").getObject();
			var material = selectedGroup.Gtin;
			this.GetData(material, "-");
		},

		getContextByIndexp: function(oEvent) {
			var self = this;
			var promise = $.Deferred();
			var selectedGroup = oEvent.getSource().getBindingContext("itemModel").getObject();
			var material = selectedGroup.Gtin;
			this.GetData(material, "p");
		},

		ClearBox: function(oEvent) {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/ItemsSet(Zfilter='T" + "05" + "')";
			debugger;
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					oView.byId("TOOL_BAR").setVisible(false);
					oView.byId("table1").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		searchArt: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var material = oView.byId("SearchArt").getValue();
			var URL2 = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/MessageSet(PValue='06" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL2, function(response2) {
				BusyIndicator.hide();
				if (response2.EMessage !== "" && response2.EZtype === "E") {
					var path = $.sap.getModulePath("Press_Shop_Fiori3", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response2.EMessage, {
						icon: MessageBox.Icon.ERROR,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					var oTable = oView.byId("table1");
					oTable.setVisible(true);
					material = oView.byId("SearchArt").getValue();
					oController.GetData(material);
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		GetData: function(material) {
			var oController = this;
			var oView = this.getView();
			var oTable = oView.byId("table1");
			oTable.setVisible(true);
			oView.byId("TOOL_BAR").setVisible(true);
			var searchString = "A" + material + "/05";
			material = this.getView().byId("SearchArt").setValue("");
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet?$filter=Zfilter " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				var newArray = response.results;
				var lines = newArray.length;
				var sum = parseInt(response.results[0].Menge);
				for (var i = 1; i < response.results.length; i++) {
					if (i < response.results.length) {
						sum = parseInt(response.results[i].Menge) + sum;
					}
				}
				var model2 = new JSONModel({
					"Sum": sum,
					"Products": lines
				});
				oView.setModel(model2, "Model2");
				var model = new JSONModel({
					"items": newArray
				});
				model.setSizeLimit(100);
				oView.setModel(model, "itemModel");
				//oController.checkvendor();
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		Validate: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var ocon = oView.byId("CONFIRM").getText();
			var oyes = oView.byId("YES").getText();
			var ono = oView.byId("NO").getText();
			MessageBox.show(
				ocon, {
					title: "Confirmation",
					actions: [oyes, ono],
					onClose: function(oAction) {
						if (oAction === oyes) {
							oController.SaveData();
						}
						jQuery.sap.delayedCall(500, this, function() {
							oView.byId("SearchArt").focus();
						});
					}
				});
		},

		_getDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("Press_Shop_Fiori3.view.ChooseVendor", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onOpenDialog: function() {
			this._getDialog().open();
		},

		onSave: function(event) {
			var oController = this;
			var vendor = sap.ui.getCore().byId("oSelect").getSelectedKey();
			var matnr = this._getDialog().getBindingContext().getObject().Matnr;
			this._getDialog().close();
			var sPath = "/UpdateVendor";
			var sServiceUrl = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/";
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.callFunction(sPath, {
				method: "GET",
				urlParameters: {
					lifnr: vendor,
					Matnr: matnr
				},
				success: function(oData, response) {
					MessageBox.show("Vendor updated", {
						icon: MessageBox.Icon.INFORMATION,
						onClose: function() {
							oController._getDialog().unbindContext();
							oController.GetData();
						}
					});
				},
				error: function(error) {
					oController._getDialog().unbindContext();
					MessageBox.error(JSON.parse(error.response.body).error.message.value, {
						title: "Error"
					});
				}
			});
		},

		fillmissingvendor: function(oEvent) {
			var oController = this;
			var oView = this.getView();
			var found = false;
			oView.byId("table1").getItems().forEach(function(row) {
				if (row.getCells()[2].getText() === "" && found === false) {
					found = true;
					oController.onOpenDialog();
					var query = "/ArticleSet('" + row.getCells()[0].getText() + "')";
					oController._getDialog().bindElement({
						path: query,
						parameters: {
							expand: "ArticleVendor"
						}
					});
				}
			});
			if (found === false) {
				MessageBox.show("All Vendors are filled");
			}
		},

		checkvendor: function() {
			// var oView = this.getView();
			// var found = false;
			// oView.byId("table1").getItems().forEach(function(row) {
			// 	if (row.getCells()[2].getText() === "") {
			// 		oView.byId("fillvendor").setVisible(true);
			// 		found = true;
			// 	}
			// });
			// if (found === false) {
			// 	oView.byId("fillvendor").setVisible(false);
			// }
		},

		SaveData: function() {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='C" + "05" + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					oView.byId("TOOL_BAR").setVisible(false);
					oView.byId("table1").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					var path = $.sap.getModulePath("Press_Shop_Fiori3", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.ERROR,
						title: "Dear User",
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		}
	});
});