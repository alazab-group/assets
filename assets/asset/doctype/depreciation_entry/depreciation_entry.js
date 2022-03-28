// Copyright (c) 2022, Ganga Manoj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Depreciation Entry', {
	setup: function(frm) {
		frm.fields_dict.cost_center.get_query = function(doc) {
			return {
				filters: {
					'is_group': 0,
					'company': doc.company
				}
			};
		};

		frm.fields_dict.asset.get_query = function(doc) {
			return {
				filters: {
					'docstatus': 1
				}
			};
		};

		frm.fields_dict.serial_no.get_query = function(doc) {
			return {
				filters: {
					'asset': doc.asset
				}
			};
		};

		frm.fields_dict.reference_doctype.get_query = function(doc) {
			return {
				filters: {
					'name': ['in', ['Asset_', 'Asset Serial No', 'Depreciation Schedule_']]
				}
			};
		};
	},

	refresh: function(frm) {
		frm.trigger('toggle_display_and_reqd_for_serial_no');
		frm.trigger('toggle_display_for_finance_book');

		if(frm.doc.docstatus > 0) {
			frm.add_custom_button(__('View General Ledger'), function() {
				frappe.route_options = {
					'voucher_no': frm.doc.name,
					'from_date': frm.doc.posting_date,
					'to_date': moment(frm.doc.modified).format('YYYY-MM-DD'),
					'company': frm.doc.company,
					'finance_book': frm.doc.finance_book,
					'group_by': 'Group by Voucher (Consolidated)',
					'show_cancelled_entries': frm.doc.docstatus === 2
				};
				frappe.set_route('query-report', 'General Ledger');
			});
		}
	},

	asset: (frm) => {
		frm.trigger('toggle_display_and_reqd_for_serial_no');
		frm.trigger('toggle_display_for_finance_book');
		frm.trigger('set_credit_and_debit_accounts');
	},

	company: (frm) => {
		frm.trigger('set_credit_and_debit_accounts');
	},

	toggle_display_and_reqd_for_serial_no: (frm) => {
		if (frm.doc.asset) {
			frappe.db.get_value('Asset_', frm.doc.asset, ['is_serialized_asset'], (r) => {
				if (r && r.is_serialized_asset) {
					frm.set_df_property('serial_no', 'hidden', 0);
					frm.set_df_property('serial_no', 'reqd', 1);
				} else {
					frm.set_df_property('serial_no', 'hidden', 1);
					frm.set_df_property('serial_no', 'reqd', 0);
					frm.set_value('serial_no', '');
				}
			});
		} else {
			frm.set_df_property('serial_no', 'hidden', 1);
		}
	},

	toggle_display_for_finance_book: (frm) => {
		if (frm.doc.asset) {
			frappe.db.get_value('Asset_', frm.doc.asset, ['calculate_depreciation'], (r) => {
				if (r && r.calculate_depreciation) {
					if (frm.doc.serial_no) {
						var doctype = 'Asset Serial No';
						var docname = frm.doc.serial_no;
					} else {
						var doctype = 'Asset_';
						var docname = frm.doc.asset;
					}

					frappe.db.get_doc(doctype, docname).then(data => {
						if (data.finance_books.length > 1) {
							frm.set_df_property('finance_book', 'read_only', 0);
							frm.set_df_property('finance_book', 'reqd', 1);
						} else {
							frm.set_df_property('finance_book', 'read_only', 1);
							frm.set_df_property('finance_book', 'reqd', 0);
						}
					})
				} else {
					frm.set_df_property('finance_book', 'read_only', 1);
				}
			})
		} else {
			frm.set_df_property('finance_book', 'read_only', 1);
		}
	},

	set_credit_and_debit_accounts: (frm) => {
		if (frm.doc.asset && frm.doc.company) {
			frappe.db.get_value('Asset_', frm.doc.asset, ['asset_category'], (r) => {
				if (r && r.asset_category) {
					frappe.call ({
						method: 'assets.asset.doctype.depreciation_schedule_.depreciation_posting.get_depreciation_accounts',
						args: {
							'asset_category': r.asset_category,
							'company': frm.doc.company
						},
						callback: function(r) {
							if(r.message) {
								frm.set_value('credit_account', r.message[0]);
								frm.set_value('debit_account', r.message[1]);
							}
						}
					});
				}
			})
		}
	}
});
