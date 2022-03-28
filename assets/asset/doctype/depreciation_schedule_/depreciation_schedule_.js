// Copyright (c) 2021, Ganga Manoj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Depreciation Schedule_', {
	setup: function(frm) {
		frm.fields_dict.serial_no.get_query = function(doc) {
			return {
				filters: {
					'asset': doc.asset
				}
			};
		};
	},

	refresh: function(frm) {
		if (frm.doc.status == "Active") {
			frm.add_custom_button(__("Post Depreciation Entries"), function() {
				frm.trigger("post_depreciation_entries");
			});
		}

		if (in_list(["Save Failed", "Submit Failed"], frm.doc.depr_entry_posting_status)) {
			frm.trigger("set_depr_posting_failure_alert");
		}
	},

	post_depreciation_entries: function(frm) {
		frappe.call({
			method: "assets.asset.doctype.depreciation_schedule_.depreciation_posting.post_depreciation_entries",
			args: {
				"schedule_name": frm.doc.name
			},
			callback: function(r) {
				frappe.model.sync(r.message);
				frm.refresh();
			}
		})
	},

	set_depr_posting_failure_alert: function (frm) {
		let save_or_submit = frm.doc.depr_entry_posting_status == "Save Failed" ? "save" : "submit";

		let alert = `
			<div class="row">
				<div class="col-xs-12 col-sm-6">
					<span class="indicator whitespace-nowrap red">
						<span>Failed to ${save_or_submit} Depreciation Entry</span>
					</span>
				</div>
			</div>`;

		frm.dashboard.set_headline_alert(alert);
	},

	asset: (frm) => {
		frappe.db.get_value('Asset_', frm.doc.asset, 'is_serialized_asset', (r) => {
			if (r && r.is_serialized_asset) {
				frm.set_df_property('serial_no', 'read_only', 0);
				frm.set_df_property('serial_no', 'reqd', 1);
			} else {
				frm.set_df_property('serial_no', 'read_only', 1);
				frm.set_df_property('serial_no', 'reqd', 0);
				frm.set_value("serial_no", "");
			}
		});
	}
});
