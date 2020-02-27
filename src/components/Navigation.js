import React from 'react';

class Navigation extends React.Component{

  render() {
  return (
    <div>
    <div className="page-wrapper">
        <div className="page-inner">
            <aside className="page-sidebar">
                <div className="page-logo">
                    <a href="#" className="page-logo-link press-scale-down d-flex align-items-center position-relative" data-toggle="modal" data-target="#modal-shortcut">
                        <img src="img/logo.png" alt="SmartAdmin WebApp" aria-roledescription="logo"/>
                        <span className="page-logo-text mr-1">Muelitas</span>
                        <span className="position-absolute text-white opacity-50 small pos-top pos-right mr-2 mt-n2"></span>
                        <i className="fal fa-angle-down d-inline-block ml-1 fs-lg color-primary-300"></i>
                    </a>
                </div>

                <nav id="js-primary-nav" className="primary-nav" role="navigation">
                    <div className="nav-filter">
                        <div className="position-relative">
                            <input type="text" id="nav_filter_input" placeholder="Filter menu" className="form-control" tabIndex="0" />
                            <a href="#" onClick={e => e.preventDefault()} className="btn-primary btn-search-close js-waves-off" data-action="toggle" data-class="list-filter-active" data-target=".page-sidebar">
                                <i className="fal fa-chevron-up"></i>
                            </a>
                        </div>
                    </div>
                    <div className="info-card">
                        <img src="img/demo/avatars/avatar-admin.png" className="profile-image rounded-circle" alt="Dr. Codex Lantern"/>
                        <div className="info-card-text">
                            <a href="#" className="d-flex align-items-center text-white">
                                <span className="text-truncate text-truncate-sm d-inline-block">
                                    UserName - Name
                                </span>
                            </a>
                            <span className="d-inline-block text-truncate text-truncate-sm">Rol de Usuario</span>
                        </div>
                        <img src="img/card-backgrounds/cover-2-lg.png" className="cover" alt="cover"/>
                        <a href="#" onClick={e => e.preventDefault()} className="pull-trigger-btn" data-action="toggle" data-class="list-filter-active" data-target=".page-sidebar" data-focus="nav_filter_input">
                            <i className="fal fa-angle-down"></i>
                        </a>
                    </div>
                    <ul id="js-nav-menu" className="nav-menu">
                        <li>
                            <a href="#" title="Application Intel" data-filter-tags="application intel">
                                <i className="fal fa-info-circle"></i>
                                <span className="nav-link-text" data-i18n="nav.application_intel">Application Intel</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="intel_analytics_dashboard.html" title="Analytics Dashboard" data-filter-tags="application intel analytics dashboard">
                                        <span className="nav-link-text" data-i18n="nav.application_intel_analytics_dashboard">Analytics Dashboard</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="intel_marketing_dashboard.html" title="Marketing Dashboard" data-filter-tags="application intel marketing dashboard">
                                        <span className="nav-link-text" data-i18n="nav.application_intel_marketing_dashboard">Marketing Dashboard</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="intel_introduction.html" title="Introduction" data-filter-tags="application intel introduction">
                                        <span className="nav-link-text" data-i18n="nav.application_intel_introduction">Introduction</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="intel_privacy.html" title="Privacy" data-filter-tags="application intel privacy">
                                        <span className="nav-link-text" data-i18n="nav.application_intel_privacy">Privacy</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="intel_build_notes.html" title="Build Notes" data-filter-tags="application intel build notes">
                                        <span className="nav-link-text" data-i18n="nav.application_intel_build_notes">Build Notes</span>
                                        <span className="">v4.0.2</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Theme Settings" data-filter-tags="theme settings">
                                <i className="fal fa-cog"></i>
                                <span className="nav-link-text" data-i18n="nav.theme_settings">Theme Settings</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="settings_how_it_works.html" title="How it works" data-filter-tags="theme settings how it works">
                                        <span className="nav-link-text" data-i18n="nav.theme_settings_how_it_works">How it works</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="settings_layout_options.html" title="Layout Options" data-filter-tags="theme settings layout options">
                                        <span className="nav-link-text" data-i18n="nav.theme_settings_layout_options">Layout Options</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="settings_skin_options.html" title="Skin Options" data-filter-tags="theme settings skin options">
                                        <span className="nav-link-text" data-i18n="nav.theme_settings_skin_options">Skin Options</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="settings_saving_db.html" title="Saving to Database" data-filter-tags="theme settings saving to database">
                                        <span className="nav-link-text" data-i18n="nav.theme_settings_saving_to_database">Saving to Database</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Package Info" data-filter-tags="package info">
                                <i className="fal fa-tag"></i>
                                <span className="nav-link-text" data-i18n="nav.package_info">Package Info</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="info_app_docs.html" title="Documentation" data-filter-tags="package info documentation">
                                        <span className="nav-link-text" data-i18n="nav.package_info_documentation">Documentation</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="info_app_licensing.html" title="Product Licensing" data-filter-tags="package info product licensing">
                                        <span className="nav-link-text" data-i18n="nav.package_info_product_licensing">Product Licensing</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="info_app_flavors.html" title="Different Flavors" data-filter-tags="package info different flavors">
                                        <span className="nav-link-text" data-i18n="nav.package_info_different_flavors">Different Flavors</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-title">Tools & Components</li>
                        <li>
                            <a href="#" title="UI Components" data-filter-tags="ui components">
                                <i className="fal fa-window"></i>
                                <span className="nav-link-text" data-i18n="nav.ui_components">UI Components</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="ui_alerts.html" title="Alerts" data-filter-tags="ui components alerts">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_alerts">Alerts</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_accordion.html" title="Accordions" data-filter-tags="ui components accordions">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_accordions">Accordions</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_badges.html" title="Badges" data-filter-tags="ui components badges">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_badges">Badges</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_breadcrumbs.html" title="Breadcrumbs" data-filter-tags="ui components breadcrumbs">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_breadcrumbs">Breadcrumbs</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_buttons.html" title="Buttons" data-filter-tags="ui components buttons">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_buttons">Buttons</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_button_group.html" title="Button Group" data-filter-tags="ui components button group">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_button_group">Button Group</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_cards.html" title="Cards" data-filter-tags="ui components cards">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_cards">Cards</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_carousel.html" title="Carousel" data-filter-tags="ui components carousel">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_carousel">Carousel</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_collapse.html" title="Collapse" data-filter-tags="ui components collapse">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_collapse">Collapse</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_dropdowns.html" title="Dropdowns" data-filter-tags="ui components dropdowns">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_dropdowns">Dropdowns</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_list_filter.html" title="List Filter" data-filter-tags="ui components list filter">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_list_filter">List Filter</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_modal.html" title="Modal" data-filter-tags="ui components modal">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_modal">Modal</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_navbars.html" title="Navbars" data-filter-tags="ui components navbars">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_navbars">Navbars</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_panels.html" title="Panels" data-filter-tags="ui components panels">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_panels">Panels</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_pagination.html" title="Pagination" data-filter-tags="ui components pagination">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_pagination">Pagination</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_popovers.html" title="Popovers" data-filter-tags="ui components popovers">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_popovers">Popovers</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_progress_bars.html" title="Progress Bars" data-filter-tags="ui components progress bars">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_progress_bars">Progress Bars</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_scrollspy.html" title="ScrollSpy" data-filter-tags="ui components scrollspy">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_scrollspy">ScrollSpy</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_side_panel.html" title="Side Panel" data-filter-tags="ui components side panel">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_side_panel">Side Panel</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_spinners.html" title="Spinners" data-filter-tags="ui components spinners">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_spinners">Spinners</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_tabs_pills.html" title="Tabs & Pills" data-filter-tags="ui components tabs & pills">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_tabs_&_pills">Tabs & Pills</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_toasts.html" title="Toasts" data-filter-tags="ui components toasts">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_toasts">Toasts</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="ui_tooltips.html" title="Tooltips" data-filter-tags="ui components tooltips">
                                        <span className="nav-link-text" data-i18n="nav.ui_components_tooltips">Tooltips</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Utilities" data-filter-tags="utilities">
                                <i className="fal fa-bolt"></i>
                                <span className="nav-link-text" data-i18n="nav.utilities">Utilities</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="utilities_borders.html" title="Borders" data-filter-tags="utilities borders">
                                        <span className="nav-link-text" data-i18n="nav.utilities_borders">Borders</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_clearfix.html" title="Clearfix" data-filter-tags="utilities clearfix">
                                        <span className="nav-link-text" data-i18n="nav.utilities_clearfix">Clearfix</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_color_pallet.html" title="Color Pallet" data-filter-tags="utilities color pallet">
                                        <span className="nav-link-text" data-i18n="nav.utilities_color_pallet">Color Pallet</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_display_property.html" title="Display Property" data-filter-tags="utilities display property">
                                        <span className="nav-link-text" data-i18n="nav.utilities_display_property">Display Property</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_fonts.html" title="Fonts" data-filter-tags="utilities fonts">
                                        <span className="nav-link-text" data-i18n="nav.utilities_fonts">Fonts</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_flexbox.html" title="Flexbox" data-filter-tags="utilities flexbox">
                                        <span className="nav-link-text" data-i18n="nav.utilities_flexbox">Flexbox</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_helpers.html" title="Helpers" data-filter-tags="utilities helpers">
                                        <span className="nav-link-text" data-i18n="nav.utilities_helpers">Helpers</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_position.html" title="Position" data-filter-tags="utilities position">
                                        <span className="nav-link-text" data-i18n="nav.utilities_position">Position</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_responsive_grid.html" title="Responsive Grid" data-filter-tags="utilities responsive grid">
                                        <span className="nav-link-text" data-i18n="nav.utilities_responsive_grid">Responsive Grid</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_sizing.html" title="Sizing" data-filter-tags="utilities sizing">
                                        <span className="nav-link-text" data-i18n="nav.utilities_sizing">Sizing</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_spacing.html" title="Spacing" data-filter-tags="utilities spacing">
                                        <span className="nav-link-text" data-i18n="nav.utilities_spacing">Spacing</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="utilities_typography.html" title="Typography" data-filter-tags="utilities typography fonts headings bold lead colors sizes link text states list styles truncate alignment">
                                        <span className="nav-link-text" data-i18n="nav.utilities_typography">Typography</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="Menu child" data-filter-tags="utilities menu child">
                                        <span className="nav-link-text" data-i18n="nav.utilities_menu_child">Menu child</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="#" onClick={e => e.preventDefault()} title="Sublevel Item" data-filter-tags="utilities menu child sublevel item">
                                                <span className="nav-link-text" data-i18n="nav.utilities_menu_child_sublevel_item">Sublevel Item</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" onClick={e => e.preventDefault()} title="Another Item" data-filter-tags="utilities menu child another item">
                                                <span className="nav-link-text" data-i18n="nav.utilities_menu_child_another_item">Another Item</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="disabled">
                                    <a href="#" onClick={e => e.preventDefault()} title="Disabled item" data-filter-tags="utilities disabled item">
                                        <span className="nav-link-text" data-i18n="nav.utilities_disabled_item">Disabled item</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Font Icons" data-filter-tags="font icons">
                                <i className="fal fa-map-marker-alt"></i>
                                <span className="nav-link-text" data-i18n="nav.font_icons">Font Icons</span>
                                <span className="dl-ref bg-primary-500 hidden-nav-function-minify hidden-nav-function-top">2,500+</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="FontAwesome" data-filter-tags="font icons fontawesome">
                                        <span className="nav-link-text" data-i18n="nav.font_icons_fontawesome">FontAwesome Pro</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="icons_fontawesome_light.html" title="Light" data-filter-tags="font icons fontawesome light">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_fontawesome_light">Light</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="icons_fontawesome_regular.html" title="Regular" data-filter-tags="font icons fontawesome regular">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_fontawesome_regular">Regular</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="icons_fontawesome_solid.html" title="Solid" data-filter-tags="font icons fontawesome solid">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_fontawesome_solid">Solid</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="icons_fontawesome_brand.html" title="Brand" data-filter-tags="font icons fontawesome brand">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_fontawesome_brand">Brand</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="NextGen Icons" data-filter-tags="font icons nextgen icons">
                                        <span className="nav-link-text" data-i18n="nav.font_icons_nextgen_icons">NextGen Icons</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="icons_nextgen_general.html" title="General" data-filter-tags="font icons nextgen icons general">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_nextgen_icons_general">General</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="icons_nextgen_base.html" title="Base" data-filter-tags="font icons nextgen icons base">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_nextgen_icons_base">Base</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="Stack Icons" data-filter-tags="font icons stack icons">
                                        <span className="nav-link-text" data-i18n="nav.font_icons_stack_icons">Stack Icons</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="icons_stack_showcase.html" title="Showcase" data-filter-tags="font icons stack icons showcase">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_stack_icons_showcase">Showcase</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="icons_stack_generate.html?layers=3" title="Generate Stack" data-filter-tags="font icons stack icons generate stack">
                                                <span className="nav-link-text" data-i18n="nav.font_icons_stack_icons_generate_stack">Generate Stack</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Tables" data-filter-tags="tables">
                                <i className="fal fa-th-list"></i>
                                <span className="nav-link-text" data-i18n="nav.tables">Tables</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="tables_basic.html" title="Basic Tables" data-filter-tags="tables basic tables">
                                        <span className="nav-link-text" data-i18n="nav.tables_basic_tables">Basic Tables</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="tables_generate_style.html" title="Generate Table Style" data-filter-tags="tables generate table style">
                                        <span className="nav-link-text" data-i18n="nav.tables_generate_table_style">Generate Table Style</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Form Stuff" data-filter-tags="form stuff">
                                <i className="fal fa-edit"></i>
                                <span className="nav-link-text" data-i18n="nav.form_stuff">Form Stuff</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="form_basic_inputs.html" title="Basic Inputs" data-filter-tags="form stuff basic inputs">
                                        <span className="nav-link-text" data-i18n="nav.form_stuff_basic_inputs">Basic Inputs</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_checkbox_radio.html" title="Checkbox & Radio" data-filter-tags="form stuff checkbox & radio">
                                        <span className="nav-link-text" data-i18n="nav.form_stuff_checkbox_&_radio">Checkbox & Radio</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_input_groups.html" title="Input Groups" data-filter-tags="form stuff input groups">
                                        <span className="nav-link-text" data-i18n="nav.form_stuff_input_groups">Input Groups</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_validation.html" title="Validation" data-filter-tags="form stuff validation">
                                        <span className="nav-link-text" data-i18n="nav.form_stuff_validation">Validation</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-title">Plugins & Addons</li>
                        <li>
                            <a href="#" title="Plugins" data-filter-tags="plugins">
                                <i className="fal fa-shield-alt"></i>
                                <span className="nav-link-text" data-i18n="nav.plugins">Core Plugins</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="plugin_faq.html" title="Plugins FAQ" data-filter-tags="plugins plugins faq">
                                        <span className="nav-link-text" data-i18n="nav.plugins_plugins_faq">Plugins FAQ</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_waves.html" title="Waves" data-filter-tags="plugins waves">
                                        <span className="nav-link-text" data-i18n="nav.plugins_waves">Waves</span>
                                        <span className="dl-ref label bg-primary-400 ml-2">9 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_pacejs.html" title="PaceJS" data-filter-tags="plugins pacejs">
                                        <span className="nav-link-text" data-i18n="nav.plugins_pacejs">PaceJS</span>
                                        <span className="dl-ref label bg-primary-500 ml-2">13 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_smartpanels.html" title="SmartPanels" data-filter-tags="plugins smartpanels">
                                        <span className="nav-link-text" data-i18n="nav.plugins_smartpanels">SmartPanels</span>
                                        <span className="dl-ref label bg-primary-600 ml-2">9 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_bootbox.html" title="BootBox" data-filter-tags="plugins bootbox alert sound">
                                        <span className="nav-link-text" data-i18n="nav.plugins_bootbox">BootBox</span>
                                        <span className="dl-ref label bg-primary-600 ml-2">15 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_slimscroll.html" title="Slimscroll" data-filter-tags="plugins slimscroll">
                                        <span className="nav-link-text" data-i18n="nav.plugins_slimscroll">Slimscroll</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">5 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_throttle.html" title="Throttle" data-filter-tags="plugins throttle">
                                        <span className="nav-link-text" data-i18n="nav.plugins_throttle">Throttle</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">1 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_navigation.html" title="Navigation" data-filter-tags="plugins navigation">
                                        <span className="nav-link-text" data-i18n="nav.plugins_navigation">Navigation</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">2 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_i18next.html" title="i18next" data-filter-tags="plugins i18next">
                                        <span className="nav-link-text" data-i18n="nav.plugins_i18next">i18next</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">10 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="plugin_appcore.html" title="App.Core" data-filter-tags="plugins app.core">
                                        <span className="nav-link-text" data-i18n="nav.plugins_app.core">App.Core</span>
                                        <span className="dl-ref label bg-success-700 ml-2">14 KB</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Datatables" data-filter-tags="datatables datagrid">
                                <i className="fal fa-table"></i>
                                <span className="nav-link-text" data-i18n="nav.datatables">Datatables</span>
                                <span className="dl-ref bg-primary-500 hidden-nav-function-minify hidden-nav-function-top">235 KB</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="datatables_basic.html" title="Basic" data-filter-tags="datatables datagrid basic">
                                        <span className="nav-link-text" data-i18n="nav.datatables_basic">Basic</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_autofill.html" title="Autofill" data-filter-tags="datatables datagrid autofill">
                                        <span className="nav-link-text" data-i18n="nav.datatables_autofill">Autofill</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_buttons.html" title="Buttons" data-filter-tags="datatables datagrid buttons">
                                        <span className="nav-link-text" data-i18n="nav.datatables_buttons">Buttons</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_export.html" title="Export" data-filter-tags="datatables datagrid export tables pdf excel print csv">
                                        <span className="nav-link-text" data-i18n="nav.datatables_export">Export</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_colreorder.html" title="ColReorder" data-filter-tags="datatables datagrid colreorder">
                                        <span className="nav-link-text" data-i18n="nav.datatables_colreorder">ColReorder</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_columnfilter.html" title="ColumnFilter" data-filter-tags="datatables datagrid columnfilter">
                                        <span className="nav-link-text" data-i18n="nav.datatables_columnfilter">ColumnFilter</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_fixedcolumns.html" title="FixedColumns" data-filter-tags="datatables datagrid fixedcolumns">
                                        <span className="nav-link-text" data-i18n="nav.datatables_fixedcolumns">FixedColumns</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_fixedheader.html" title="FixedHeader" data-filter-tags="datatables datagrid fixedheader">
                                        <span className="nav-link-text" data-i18n="nav.datatables_fixedheader">FixedHeader</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_keytable.html" title="KeyTable" data-filter-tags="datatables datagrid keytable">
                                        <span className="nav-link-text" data-i18n="nav.datatables_keytable">KeyTable</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_responsive.html" title="Responsive" data-filter-tags="datatables datagrid responsive">
                                        <span className="nav-link-text" data-i18n="nav.datatables_responsive">Responsive</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_responsive_alt.html" title="Responsive Alt" data-filter-tags="datatables datagrid responsive alt">
                                        <span className="nav-link-text" data-i18n="nav.datatables_responsive_alt">Responsive Alt</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_rowgroup.html" title="RowGroup" data-filter-tags="datatables datagrid rowgroup">
                                        <span className="nav-link-text" data-i18n="nav.datatables_rowgroup">RowGroup</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_rowreorder.html" title="RowReorder" data-filter-tags="datatables datagrid rowreorder">
                                        <span className="nav-link-text" data-i18n="nav.datatables_rowreorder">RowReorder</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_scroller.html" title="Scroller" data-filter-tags="datatables datagrid scroller">
                                        <span className="nav-link-text" data-i18n="nav.datatables_scroller">Scroller</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_select.html" title="Select" data-filter-tags="datatables datagrid select">
                                        <span className="nav-link-text" data-i18n="nav.datatables_select">Select</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="datatables_alteditor.html" title="AltEditor" data-filter-tags="datatables datagrid alteditor">
                                        <span className="nav-link-text" data-i18n="nav.datatables_alteditor">AltEditor</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Statistics" data-filter-tags="statistics chart graphs">
                                <i className="fal fa-chart-pie"></i>
                                <span className="nav-link-text" data-i18n="nav.statistics">Statistics</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="statistics_flot.html" title="Flot" data-filter-tags="statistics chart graphs flot bar pie">
                                        <span className="nav-link-text" data-i18n="nav.statistics_flot">Flot</span>
                                        <span className="dl-ref label bg-primary-500 ml-2">36 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_chartjs.html" title="Chart.js" data-filter-tags="statistics chart graphs chart.js bar pie">
                                        <span className="nav-link-text" data-i18n="nav.statistics_chart.js">Chart.js</span>
                                        <span className="dl-ref label bg-primary-500 ml-2">205 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_chartist.html" title="Chartist.js" data-filter-tags="statistics chart graphs chartist.js">
                                        <span className="nav-link-text" data-i18n="nav.statistics_chartist.js">Chartist.js</span>
                                        <span className="dl-ref label bg-primary-600 ml-2">39 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_c3.html" title="C3 Charts" data-filter-tags="statistics chart graphs c3 charts">
                                        <span className="nav-link-text" data-i18n="nav.statistics_c3_charts">C3 Charts</span>
                                        <span className="dl-ref label bg-primary-600 ml-2">197 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_peity.html" title="Peity" data-filter-tags="statistics chart graphs peity small">
                                        <span className="nav-link-text" data-i18n="nav.statistics_peity">Peity</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">4 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_sparkline.html" title="Sparkline" data-filter-tags="statistics chart graphs sparkline small tiny">
                                        <span className="nav-link-text" data-i18n="nav.statistics_sparkline">Sparkline</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">42 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_easypiechart.html" title="Easy Pie Chart" data-filter-tags="statistics chart graphs easy pie chart">
                                        <span className="nav-link-text" data-i18n="nav.statistics_easy_pie_chart">Easy Pie Chart</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">4 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="statistics_dygraph.html" title="Dygraph" data-filter-tags="statistics chart graphs dygraph complex">
                                        <span className="nav-link-text" data-i18n="nav.statistics_dygraph">Dygraph</span>
                                        <span className="dl-ref label bg-primary-700 ml-2">120 KB</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Notifications" data-filter-tags="notifications">
                                <i className="fal fa-exclamation-circle"></i>
                                <span className="nav-link-text" data-i18n="nav.notifications">Notifications</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="notifications_sweetalert2.html" title="SweetAlert2" data-filter-tags="notifications sweetalert2">
                                        <span className="nav-link-text" data-i18n="nav.notifications_sweetalert2">SweetAlert2</span>
                                        <span className="dl-ref label bg-primary-500 ml-2">40 KB</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="notifications_toastr.html" title="Toastr" data-filter-tags="notifications toastr">
                                        <span className="nav-link-text" data-i18n="nav.notifications_toastr">Toastr</span>
                                        <span className="dl-ref label bg-primary-600 ml-2">5 KB</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Form Plugins" data-filter-tags="form plugins">
                                <i className="fal fa-credit-card-front"></i>
                                <span className="nav-link-text" data-i18n="nav.form_plugins">Form Plugins</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="form_plugins_colorpicker.html" title="Color Picker" data-filter-tags="form plugins color picker">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_color_picker">Color Picker</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugins_datepicker.html" title="Date Picker" data-filter-tags="form plugins date picker">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_date_picker">Date Picker</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugins_daterange_picker.html" title="Date Range Picker" data-filter-tags="form plugins date range picker">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_date_range_picker">Date Range Picker</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugins_dropzone.html" title="Dropzone" data-filter-tags="form plugins dropzone">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_dropzone">Dropzone</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugins_ionrangeslider.html" title="Ion.RangeSlider" data-filter-tags="form plugins ion.rangeslider">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_ion.rangeslider">Ion.RangeSlider</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugins_inputmask.html" title="Inputmask" data-filter-tags="form plugins inputmask">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_inputmask">Inputmask</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugin_imagecropper.html" title="Image Cropper" data-filter-tags="form plugins image cropper">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_image_cropper">Image Cropper</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugin_select2.html" title="Select2" data-filter-tags="form plugins select2">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_select2">Select2</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="form_plugin_summernote.html" title="Summernote" data-filter-tags="form plugins summernote texteditor editor">
                                        <span className="nav-link-text" data-i18n="nav.form_plugins_summernote">Summernote</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" title="Miscellaneous" data-filter-tags="miscellaneous">
                                <i className="fal fa-globe"></i>
                                <span className="nav-link-text" data-i18n="nav.miscellaneous">Miscellaneous</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="miscellaneous_fullcalendar.html" title="FullCalendar" data-filter-tags="miscellaneous fullcalendar">
                                        <span className="nav-link-text" data-i18n="nav.miscellaneous_fullcalendar">FullCalendar</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="miscellaneous_lightgallery.html" title="Light Gallery" data-filter-tags="miscellaneous light gallery">
                                        <span className="nav-link-text" data-i18n="nav.miscellaneous_light_gallery">Light Gallery</span>
                                        <span className="dl-ref label bg-primary-500 ml-2">61 KB</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-title">Layouts & Apps</li>
                        <li>
                            <a href="#" title="Pages" data-filter-tags="pages">
                                <i className="fal fa-plus-circle"></i>
                                <span className="nav-link-text" data-i18n="nav.pages">Page Views</span>
                            </a>
                            <ul>
                                <li>
                                    <a href="page_chat.html" title="Chat" data-filter-tags="pages chat">
                                        <span className="nav-link-text" data-i18n="nav.pages_chat">Chat</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="page_contacts.html" title="Contacts" data-filter-tags="pages contacts">
                                        <span className="nav-link-text" data-i18n="nav.pages_contacts">Contacts</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="Forum" data-filter-tags="pages forum">
                                        <span className="nav-link-text" data-i18n="nav.pages_forum">Forum</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="page_forum_list.html" title="List" data-filter-tags="pages forum list">
                                                <span className="nav-link-text" data-i18n="nav.pages_forum_list">List</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_forum_threads.html" title="Threads" data-filter-tags="pages forum threads">
                                                <span className="nav-link-text" data-i18n="nav.pages_forum_threads">Threads</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_forum_discussion.html" title="Discussion" data-filter-tags="pages forum discussion">
                                                <span className="nav-link-text" data-i18n="nav.pages_forum_discussion">Discussion</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="Inbox" data-filter-tags="pages inbox">
                                        <span className="nav-link-text" data-i18n="nav.pages_inbox">Inbox</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="page_inbox_general.html" title="General" data-filter-tags="pages inbox general">
                                                <span className="nav-link-text" data-i18n="nav.pages_inbox_general">General</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_inbox_read.html" title="Read" data-filter-tags="pages inbox read">
                                                <span className="nav-link-text" data-i18n="nav.pages_inbox_read">Read</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_inbox_write.html" title="Write" data-filter-tags="pages inbox write">
                                                <span className="nav-link-text" data-i18n="nav.pages_inbox_write">Write</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="page_invoice.html" title="Invoice (printable)" data-filter-tags="pages invoice (printable)">
                                        <span className="nav-link-text" data-i18n="nav.pages_invoice_(printable)">Invoice (printable)</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="Authentication" data-filter-tags="pages authentication">
                                        <span className="nav-link-text" data-i18n="nav.pages_authentication">Authentication</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="page_forget.html" title="Forget Password" data-filter-tags="pages authentication forget password">
                                                <span className="nav-link-text" data-i18n="nav.pages_authentication_forget_password">Forget Password</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_locked.html" title="Locked Screen" data-filter-tags="pages authentication locked screen">
                                                <span className="nav-link-text" data-i18n="nav.pages_authentication_locked_screen">Locked Screen</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_login.html" title="Login" data-filter-tags="pages authentication login">
                                                <span className="nav-link-text" data-i18n="nav.pages_authentication_login">Login</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_login-alt.html" title="Login Alt" data-filter-tags="pages authentication login alt">
                                                <span className="nav-link-text" data-i18n="nav.pages_authentication_login_alt">Login Alt</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_register.html" title="Register" data-filter-tags="pages authentication register">
                                                <span className="nav-link-text" data-i18n="nav.pages_authentication_register">Register</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_confirmation.html" title="Confirmation" data-filter-tags="pages authentication confirmation">
                                                <span className="nav-link-text" data-i18n="nav.pages_authentication_confirmation">Confirmation</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#" onClick={e => e.preventDefault()} title="Error Pages" data-filter-tags="pages error pages">
                                        <span className="nav-link-text" data-i18n="nav.pages_error_pages">Error Pages</span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="page_error.html" title="General Error" data-filter-tags="pages error pages general error">
                                                <span className="nav-link-text" data-i18n="nav.pages_error_pages_general_error">General Error</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_error_404.html" title="Server Error" data-filter-tags="pages error pages server error">
                                                <span className="nav-link-text" data-i18n="nav.pages_error_pages_server_error">Server Error</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="page_error_announced.html" title="Announced Error" data-filter-tags="pages error pages announced error">
                                                <span className="nav-link-text" data-i18n="nav.pages_error_pages_announced_error">Announced Error</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="page_profile.html" title="Profile" data-filter-tags="pages profile">
                                        <span className="nav-link-text" data-i18n="nav.pages_profile">Profile</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="page_search.html" title="Search Results" data-filter-tags="pages search results">
                                        <span className="nav-link-text" data-i18n="nav.pages_search_results">Search Results</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <div className="filter-message js-filter-message bg-success-600"></div>
                </nav>

                <div className="nav-footer shadow-top">
                    <a href="#" onClick={e => e.preventDefault()} data-action="toggle" data-class="nav-function-minify" className="hidden-md-down">
                        <i className="ni ni-chevron-right"></i>
                        <i className="ni ni-chevron-right"></i>
                    </a>
                    <ul className="list-table m-auto nav-footer-buttons">
                        <li>
                            <a href="#" onClick={e => e.preventDefault()} data-toggle="tooltip" data-placement="top" title="Chat logs">
                                <i className="fal fa-comments"></i>
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={e => e.preventDefault()} data-toggle="tooltip" data-placement="top" title="Support Chat">
                                <i className="fal fa-life-ring"></i>
                            </a>
                        </li>
                        <li>
                            <a href="#" onClick={e => e.preventDefault()} data-toggle="tooltip" data-placement="top" title="Make a call">
                                <i className="fal fa-phone"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            <div className="page-content-wrapper">

                <header className="page-header" role="banner">

                    <div className="page-logo">
                        <a href="#" className="page-logo-link press-scale-down d-flex align-items-center position-relative" data-toggle="modal" data-target="#modal-shortcut">
                            <img src="img/logo.png" alt="SmartAdmin WebApp" aria-roledescription="logo"/>
                            <span className="page-logo-text mr-1">SmartAdmin WebApp</span>
                            <span className="position-absolute text-white opacity-50 small pos-top pos-right mr-2 mt-n2"></span>
                            <i className="fal fa-angle-down d-inline-block ml-1 fs-lg color-primary-300"></i>
                        </a>
                    </div>

                    <div className="hidden-md-down dropdown-icon-menu position-relative">
                        <a href="#" className="header-btn btn js-waves-off" data-action="toggle" data-class="nav-function-hidden" title="Hide Navigation">
                            <i className="ni ni-menu"></i>
                        </a>
                        <ul>
                            <li>
                                <a href="#" className="btn js-waves-off" data-action="toggle" data-class="nav-function-minify" title="Minify Navigation">
                                    <i className="ni ni-minify-nav"></i>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="btn js-waves-off" data-action="toggle" data-class="nav-function-fixed" title="Lock Navigation">
                                    <i className="ni ni-lock-nav"></i>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="hidden-lg-up">
                        <a href="#" className="header-btn btn press-scale-down" data-action="toggle" data-class="mobile-nav-on">
                            <i className="ni ni-menu"></i>
                        </a>
                    </div>
                    <div className="search">
                        <form className="app-forms hidden-xs-down" role="search" action="page_search.html" autoComplete="off">
                            <input type="text" id="search-field" placeholder="Search for anything" className="form-control" tabIndex="1"/>
                            <a href="#" onClick={e => e.preventDefault()} className="btn-danger btn-search-close js-waves-off d-none" data-action="toggle" data-class="mobile-search-on">
                                <i className="fal fa-times"></i>
                            </a>
                        </form>
                    </div>
                    <div className="ml-auto d-flex">

                        <div className="hidden-sm-up">
                            <a href="#" className="header-icon" data-action="toggle" data-class="mobile-search-on" data-focus="search-field" title="Search">
                                <i className="fal fa-search"></i>
                            </a>
                        </div>

                        <div className="hidden-md-down">
                            <a href="#" className="header-icon" data-toggle="modal" data-target=".js-modal-settings">
                                <i className="fal fa-cog"></i>
                            </a>
                        </div>

                        <div>
                            <a href="#" className="header-icon" data-toggle="dropdown" title="My Apps">
                                <i className="fal fa-cube"></i>
                            </a>
                            <div className="dropdown-menu dropdown-menu-animated w-auto h-auto">
                                <div className="dropdown-header bg-trans-gradient d-flex justify-content-center align-items-center rounded-top">
                                    <h4 className="m-0 text-center color-white">
                                        Quick Shortcut
                                        <small className="mb-0 opacity-80">User Applications & Addons</small>
                                    </h4>
                                </div>
                                <div className="custom-scroll h-100">
                                    <ul className="app-list">
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-2 icon-stack-3x color-primary-600"></i>
                                                    <i className="base-3 icon-stack-2x color-primary-700"></i>
                                                    <i className="ni ni-settings icon-stack-1x text-white fs-lg"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Services
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-2 icon-stack-3x color-primary-400"></i>
                                                    <i className="base-10 text-white icon-stack-1x"></i>
                                                    <i className="ni md-profile color-primary-800 icon-stack-2x"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Account
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-9 icon-stack-3x color-success-400"></i>
                                                    <i className="base-2 icon-stack-2x color-success-500"></i>
                                                    <i className="ni ni-shield icon-stack-1x text-white"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Security
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-18 icon-stack-3x color-info-700"></i>
                                                    <span className="position-absolute pos-top pos-left pos-right color-white fs-md mt-2 fw-400">28</span>
                                                </span>
                                                <span className="app-list-name">
                                                    Calendar
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-7 icon-stack-3x color-info-500"></i>
                                                    <i className="base-7 icon-stack-2x color-info-700"></i>
                                                    <i className="ni ni-graph icon-stack-1x text-white"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Stats
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-4 icon-stack-3x color-danger-500"></i>
                                                    <i className="base-4 icon-stack-1x color-danger-400"></i>
                                                    <i className="ni ni-envelope icon-stack-1x text-white"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Messages
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-4 icon-stack-3x color-fusion-400"></i>
                                                    <i className="base-5 icon-stack-2x color-fusion-200"></i>
                                                    <i className="base-5 icon-stack-1x color-fusion-100"></i>
                                                    <i className="fal fa-keyboard icon-stack-1x color-info-50"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Notes
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-16 icon-stack-3x color-fusion-500"></i>
                                                    <i className="base-10 icon-stack-1x color-primary-50 opacity-30"></i>
                                                    <i className="base-10 icon-stack-1x fs-xl color-primary-50 opacity-20"></i>
                                                    <i className="fal fa-dot-circle icon-stack-1x text-white opacity-85"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Photos
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-19 icon-stack-3x color-primary-400"></i>
                                                    <i className="base-7 icon-stack-2x color-primary-300"></i>
                                                    <i className="base-7 icon-stack-1x fs-xxl color-primary-200"></i>
                                                    <i className="base-7 icon-stack-1x color-primary-500"></i>
                                                    <i className="fal fa-globe icon-stack-1x text-white opacity-85"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Maps
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-5 icon-stack-3x color-success-700 opacity-80"></i>
                                                    <i className="base-12 icon-stack-2x color-success-700 opacity-30"></i>
                                                    <i className="fal fa-comment-alt icon-stack-1x text-white"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Chat
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-5 icon-stack-3x color-warning-600"></i>
                                                    <i className="base-7 icon-stack-2x color-warning-800 opacity-50"></i>
                                                    <i className="fal fa-phone icon-stack-1x text-white"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Phone
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="app-list-item hover-white">
                                                <span className="icon-stack">
                                                    <i className="base-6 icon-stack-3x color-danger-600"></i>
                                                    <i className="fal fa-chart-line icon-stack-1x text-white"></i>
                                                </span>
                                                <span className="app-list-name">
                                                    Projects
                                                </span>
                                            </a>
                                        </li>
                                        <li className="w-100">
                                            <a href="#" className="btn btn-default mt-4 mb-2 pr-5 pl-5"> Add more apps </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <a href="#" className="header-icon" data-toggle="modal" data-target=".js-modal-messenger">
                            <i className="fal fa-globe"></i>
                            <span className="badge badge-icon">!</span>
                        </a>

                        <div>
                            <a href="#" className="header-icon" data-toggle="dropdown" title="You got 11 notifications">
                                <i className="fal fa-bell"></i>
                                <span className="badge badge-icon">11</span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-animated dropdown-xl">
                                <div className="dropdown-header bg-trans-gradient d-flex justify-content-center align-items-center rounded-top mb-2">
                                    <h4 className="m-0 text-center color-white">
                                        11 New
                                        <small className="mb-0 opacity-80">User Notifications</small>
                                    </h4>
                                </div>
                                <ul className="nav nav-tabs nav-tabs-clean" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link px-4 fs-md js-waves-on fw-500" data-toggle="tab" href="#tab-messages" data-i18n="drpdwn.messages">Messages</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link px-4 fs-md js-waves-on fw-500" data-toggle="tab" href="#tab-feeds" data-i18n="drpdwn.feeds">Feeds</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link px-4 fs-md js-waves-on fw-500" data-toggle="tab" href="#tab-events" data-i18n="drpdwn.events">Events</a>
                                    </li>
                                </ul>
                                <div className="tab-content tab-notification">
                                    <div className="tab-pane active p-3 text-center">
                                        <h5 className="mt-4 pt-4 fw-500">
                                            <span className="d-block fa-3x pb-4 text-muted">
                                                <i className="ni ni-arrow-up text-gradient opacity-70"></i>
                                            </span> Select a tab above to activate
                                            <small className="mt-3 fs-b fw-400 text-muted">
                                                This blank page message helps protect your privacy, or you can show the first message here automatically through
                                                <a href="#">settings page</a>
                                            </small>
                                        </h5>
                                    </div>
                                    <div className="tab-pane" id="tab-messages" role="tabpanel">
                                        <div className="custom-scroll h-100">
                                            <ul className="notification">
                                                <li className="unread">
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status mr-2">
                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Melissa Ayre <span className="badge badge-primary fw-n position-absolute pos-top pos-right mt-1">INBOX</span></span>
                                                            <span className="msg-a fs-sm">Re: New security codes</span>
                                                            <span className="msg-b fs-xs">Hello again and thanks for being part...</span>
                                                            <span className="fs-nano text-muted mt-1">56 seconds ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li className="unread">
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status mr-2">
                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Adison Lee</span>
                                                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                                                            <span className="fs-nano text-muted mt-1">2 minutes ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status status-success mr-2">
                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Oliver Kopyuv</span>
                                                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                                                            <span className="fs-nano text-muted mt-1">3 days ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status status-warning mr-2">
                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Dr. John Cook PhD</span>
                                                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                                                            <span className="fs-nano text-muted mt-1">2 weeks ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status status-success mr-2">

                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Sarah McBrook</span>
                                                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                                                            <span className="fs-nano text-muted mt-1">3 weeks ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status status-success mr-2">
                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Anothony Bezyeth</span>
                                                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                                                            <span className="fs-nano text-muted mt-1">one month ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" className="d-flex align-items-center">
                                                        <span className="status status-danger mr-2">
                                                            <span className="profile-image rounded-circle d-inline-block"></span>
                                                        </span>
                                                        <span className="d-flex flex-column flex-1 ml-1">
                                                            <span className="name">Lisa Hatchensen</span>
                                                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                                                            <span className="fs-nano text-muted mt-1">one year ago</span>
                                                        </span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="tab-pane" id="tab-feeds" role="tabpanel">
                                        <div className="custom-scroll h-100">
                                            <ul className="notification">
                                                <li className="unread">
                                                    <div className="d-flex align-items-center show-child-on-hover">
                                                        <span className="d-flex flex-column flex-1">
                                                            <span className="name d-flex align-items-center">Administrator <span className="badge badge-success fw-n ml-1">UPDATE</span></span>
                                                            <span className="msg-a fs-sm">
                                                                System updated to version <strong>4.0.2</strong> <a href="intel_build_notes.html">(patch notes)</a>
                                                            </span>
                                                            <span className="fs-nano text-muted mt-1">5 mins ago</span>
                                                        </span>
                                                        <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                                                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="d-flex align-items-center show-child-on-hover">
                                                        <div className="d-flex flex-column flex-1">
                                                            <span className="name">
                                                                Adison Lee <span className="fw-300 d-inline">replied to your video <a href="#" className="fw-400"> Cancer Drug</a> </span>
                                                            </span>
                                                            <span className="msg-a fs-sm mt-2">Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day...</span>
                                                            <span className="fs-nano text-muted mt-1">10 minutes ago</span>
                                                        </div>
                                                        <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                                                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="d-flex align-items-center show-child-on-hover">

                                                        <div className="d-flex flex-column flex-1">
                                                            <span className="name">
                                                                Troy Norman'<span className="fw-300">s new connections</span>
                                                            </span>
                                                            <div className="fs-sm d-flex align-items-center mt-2">
                                                                <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                                                                <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                                                                <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                                                                <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                                                                <div data-hasmore="+3" className="rounded-circle profile-image-md mr-1">
                                                                    <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                                                                </div>
                                                            </div>
                                                            <span className="fs-nano text-muted mt-1">55 minutes ago</span>
                                                        </div>
                                                        <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                                                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="d-flex align-items-center show-child-on-hover">
                                                        <div className="d-flex flex-column flex-1">
                                                            <span className="name">Dr John Cook <span className="fw-300">sent a <span className="text-danger">new signal</span></span></span>
                                                            <span className="msg-a fs-sm mt-2">Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.</span>
                                                            <span className="fs-nano text-muted mt-1">10 minutes ago</span>
                                                        </div>
                                                        <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                                                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="d-flex align-items-center show-child-on-hover">
                                                        <div className="d-flex flex-column flex-1">
                                                            <span className="name">Lab Images <span className="fw-300">were updated!</span></span>
                                                            <div className="fs-sm d-flex align-items-center mt-1">
                                                                <a href="#" className="mr-1 mt-1" title="Cell A-0012">
                                                                    <span className="d-block img-share" ></span>
                                                                </a>
                                                                <a href="#" className="mr-1 mt-1" title="Patient A-473 saliva">
                                                                    <span className="d-block img-share" ></span>
                                                                </a>
                                                                <a href="#" className="mr-1 mt-1" title="Patient A-473 blood cells">
                                                                    <span className="d-block img-share" ></span>
                                                                </a>
                                                                <a href="#" className="mr-1 mt-1" title="Patient A-473 Membrane O.C">
                                                                    <span className="d-block img-share" ></span>
                                                                </a>
                                                            </div>
                                                            <span className="fs-nano text-muted mt-1">55 minutes ago</span>
                                                        </div>
                                                        <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                                                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="d-flex align-items-center show-child-on-hover">

                                                        <div className="d-flex flex-column flex-1">
                                                            <div className="name mb-2">
                                                                Lisa Lamar<span className="fw-300"> updated project</span>
                                                            </div>
                                                            <div className="row fs-b fw-300">
                                                                <div className="col text-left">
                                                                    Progress
                                                                </div>
                                                                <div className="col text-right fw-500">
                                                                    45%
                                                                </div>
                                                            </div>
                                                            <div className="progress progress-sm d-flex mt-1">
                                                                <span className="progress-bar-45 progress-bar bg-primary-500 progress-bar-striped" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></span>
                                                            </div>
                                                            <span className="fs-nano text-muted mt-1">2 hrs ago</span>
                                                            <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                                                                <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="tab-pane" id="tab-events" role="tabpanel">
                                        <div className="d-flex flex-column h-100">
                                            <div className="h-auto">
                                                <table className="table table-bordered table-calendar m-0 w-100 h-100 border-0">
                                                <tbody>
                                                    <tr>
                                                        <th colSpan="7" className="pt-3 pb-2 pl-3 pr-3 text-center">
                                                            <div className="js-get-date h5 mb-2">[your date here]</div>
                                                        </th>
                                                    </tr>
                                                    <tr className="text-center">
                                                        <th>Sun</th>
                                                        <th>Mon</th>
                                                        <th>Tue</th>
                                                        <th>Wed</th>
                                                        <th>Thu</th>
                                                        <th>Fri</th>
                                                        <th>Sat</th>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-muted bg-faded">30</td>
                                                        <td>1</td>
                                                        <td>2</td>
                                                        <td>3</td>
                                                        <td>4</td>
                                                        <td>5</td>
                                                        <td><i className="fal fa-birthday-cake mt-1 ml-1 position-absolute pos-left pos-top text-primary"></i> 6</td>
                                                    </tr>
                                                    <tr>
                                                        <td>7</td>
                                                        <td>8</td>
                                                        <td>9</td>
                                                        <td className="bg-primary-300 pattern-0">10</td>
                                                        <td>11</td>
                                                        <td>12</td>
                                                        <td>13</td>
                                                    </tr>
                                                    <tr>
                                                        <td>14</td>
                                                        <td>15</td>
                                                        <td>16</td>
                                                        <td>17</td>
                                                        <td>18</td>
                                                        <td>19</td>
                                                        <td>20</td>
                                                    </tr>
                                                    <tr>
                                                        <td>21</td>
                                                        <td>22</td>
                                                        <td>23</td>
                                                        <td>24</td>
                                                        <td>25</td>
                                                        <td>26</td>
                                                        <td>27</td>
                                                    </tr>
                                                    <tr>
                                                        <td>28</td>
                                                        <td>29</td>
                                                        <td>30</td>
                                                        <td>31</td>
                                                        <td className="text-muted bg-faded">1</td>
                                                        <td className="text-muted bg-faded">2</td>
                                                        <td className="text-muted bg-faded">3</td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                            </div>
                                            <div className="flex-1 custom-scroll">
                                                <div className="p-2">
                                                    <div className="d-flex align-items-center text-left mb-3">
                                                        <div className="width-5 fw-300 text-primary l-h-n mr-1 align-self-start fs-xxl">
                                                            15
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="d-flex flex-column">
                                                                <span className="l-h-n fs-md fw-500 opacity-70">
                                                                    October 2020
                                                                </span>
                                                                <span className="l-h-n fs-nano fw-400 text-secondary">
                                                                    Friday
                                                                </span>
                                                            </div>
                                                            <div className="mt-3">
                                                                <p>
                                                                    <strong>2:30PM</strong> - Doctor's appointment
                                                                </p>
                                                                <p>
                                                                    <strong>3:30PM</strong> - Report overview
                                                                </p>
                                                                <p>
                                                                    <strong>4:30PM</strong> - Meeting with Donnah V.
                                                                </p>
                                                                <p>
                                                                    <strong>5:30PM</strong> - Late Lunch
                                                                </p>
                                                                <p>
                                                                    <strong>6:30PM</strong> - Report Compression
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2 px-3 bg-faded d-block rounded-bottom text-right border-faded border-bottom-0 border-right-0 border-left-0">
                                    <a href="#" className="fs-xs fw-500 ml-auto">view all notifications</a>
                                </div>
                            </div>
                        </div>

                        <div>
                            <a href="#" data-toggle="dropdown" title="drlantern@gotbootstrap.com" className="header-icon d-flex align-items-center justify-content-center ml-2">
                                <img src="img/demo/avatars/avatar-admin.png" className="profile-image rounded-circle" alt="Dr. Codex Lantern"/>

              <span className="ml-1 mr-1 text-truncate text-truncate-header hidden-xs-down">Me</span>
              <i className="ni ni-chevron-down hidden-xs-down"></i> -->
                            </a>
                            <div className="dropdown-menu dropdown-menu-animated dropdown-lg">
                                <div className="dropdown-header bg-trans-gradient d-flex flex-row py-4 rounded-top">
                                    <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
                                        <span className="mr-2">
                                            <img src="img/demo/avatars/avatar-admin.png" className="rounded-circle profile-image" alt="Dr. Codex Lantern"/>
                                        </span>
                                        <div className="info-card-text">
                                            <div className="fs-lg text-truncate text-truncate-lg">Dr. Codex Lantern</div>
                                            <span className="text-truncate text-truncate-md opacity-80">drlantern@gotbootstrap.com</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="dropdown-divider m-0"></div>
                                <a href="#" className="dropdown-item" data-action="app-reset">
                                    <span data-i18n="drpdwn.reset_layout">Reset Layout</span>
                                </a>
                                <a href="#" className="dropdown-item" data-toggle="modal" data-target=".js-modal-settings">
                                    <span data-i18n="drpdwn.settings">Settings</span>
                                </a>
                                <div className="dropdown-divider m-0"></div>
                                <a href="#" className="dropdown-item" data-action="app-fullscreen">
                                    <span data-i18n="drpdwn.fullscreen">Fullscreen</span>
                                    <i className="float-right text-muted fw-n">F11</i>
                                </a>
                                <a href="#" className="dropdown-item" data-action="app-print">
                                    <span data-i18n="drpdwn.print">Print</span>
                                    <i className="float-right text-muted fw-n">Ctrl + P</i>
                                </a>
                                <div className="dropdown-multilevel dropdown-multilevel-left">
                                    <div className="dropdown-item">
                                        Language
                                    </div>
                                    <div className="dropdown-menu">
                                        <a href="#?lang=fr" className="dropdown-item" data-action="lang" data-lang="fr">Français</a>
                                        <a href="#?lang=en" className="dropdown-item active" data-action="lang" data-lang="en">English (US)</a>
                                        <a href="#?lang=es" className="dropdown-item" data-action="lang" data-lang="es">Español</a>
                                        <a href="#?lang=ru" className="dropdown-item" data-action="lang" data-lang="ru">Русский язык</a>
                                        <a href="#?lang=jp" className="dropdown-item" data-action="lang" data-lang="jp">日本語</a>
                                        <a href="#?lang=ch" className="dropdown-item" data-action="lang" data-lang="ch">中文</a>
                                    </div>
                                </div>
                                <div className="dropdown-divider m-0"></div>
                                <a className="dropdown-item fw-500 pt-3 pb-3" href="page_login_alt.html">
                                    <span data-i18n="drpdwn.page-logout">Logout</span>
                                    <span className="float-right fw-n">&commat;codexlantern</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                <main id="js-page-content" role="main" className="page-content">
                    <ol className="breadcrumb page-breadcrumb">
                        <li className="breadcrumb-item"><a href="#" onClick={e => e.preventDefault()}>SmartAdmin</a></li>
                        <li className="breadcrumb-item">category_1</li>
                        <li className="breadcrumb-item">category_2</li>
                        <li className="breadcrumb-item active">Page Titile</li>
                        <li className="position-absolute pos-top pos-right d-none d-sm-block"><span className="js-get-date"></span></li>
                    </ol>
                    <div className="subheader">
                        <h1 className="subheader-title">
                            <i className='subheader-icon fal fa-'></i> Page <span className='fw-300'>Title</span> <sup className='badge badge-primary fw-500'>ADDON</sup>
                            <small>
                                blank description
                            </small>
                        </h1>
                        <div className="subheader-block">
                            Right content of header
                        </div>
                    </div>
                    <div className="alert alert-primary">
                        <div className="d-flex flex-start w-100">
                            <div className="mr-2 hidden-md-down">
                                <span className="icon-stack icon-stack-lg">
                                    <i className="base base-6 icon-stack-3x opacity-100 color-primary-500"></i>
                                    <i className="base base-10 icon-stack-2x opacity-100 color-primary-300 fa-flip-vertical"></i>
                                    <i className="ni ni-blog-read icon-stack-1x opacity-100 color-white"></i>
                                </span>
                            </div>
                            <div className="d-flex flex-fill">
                                <div className="flex-fill">
                                    <span className="h5">About</span>
                                    <p>Points.</p>
                                    <p className="m-0">
                                        Find in-depth, guidelines, tutorials and more on Addon's <a href="#" target="_blank">Official Documentation</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-12">
                            <div id="panel-1" className="panel">
                                <div className="panel-hdr">
                                    <h2>
                                        Panel <span className="fw-300"><i>Title</i></span>
                                    </h2>
                                    <div className="panel-toolbar">
                                        <button className="btn btn-panel" data-action="panel-collapse" data-toggle="tooltip" data-offset="0,10" data-original-title="Collapse"></button>
                                        <button className="btn btn-panel" data-action="panel-fullscreen" data-toggle="tooltip" data-offset="0,10" data-original-title="Fullscreen"></button>
                                        <button className="btn btn-panel" data-action="panel-close" data-toggle="tooltip" data-offset="0,10" data-original-title="Close"></button>
                                    </div>
                                </div>
                                <div className="panel-container show">
                                    <div className="panel-content">
                                        <div className="panel-tag">
                                            Panel tag <code>code</code>
                                        </div>
                                        Text
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <div className="page-content-overlay" data-action="toggle" data-class="mobile-nav-on"></div>

                <footer className="page-footer" role="contentinfo">
                    <div className="d-flex align-items-center flex-1 text-muted">
                        <span className="hidden-md-down fw-700">2019 © SmartAdmin by&nbsp;<a href='https://www.gotbootstrap.com' className='text-primary fw-500' title='gotbootstrap.com' target='_blank'>gotbootstrap.com</a></span>
                    </div>
                    <div>
                        <ul className="list-table m-0">
                            <li><a href="intel_introduction.html" className="text-secondary fw-700">About</a></li>
                            <li className="pl-3"><a href="info_app_licensing.html" className="text-secondary fw-700">License</a></li>
                            <li className="pl-3"><a href="info_app_docs.html" className="text-secondary fw-700">Documentation</a></li>
                            <li className="pl-3 fs-xl"><a href="https://wrapbootstrap.com/user/MyOrange" className="text-secondary" target="_blank"><i className="fal fa-question-circle" aria-hidden="true"></i></a></li>
                        </ul>
                    </div>
                </footer>

                <div className="modal fade modal-backdrop-transparent" id="modal-shortcut" tabIndex="-1" role="dialog" aria-labelledby="modal-shortcut" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-top modal-transparent" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <ul className="app-list w-auto h-auto p-0 text-left">
                                    <li>
                                        <a href="intel_introduction.html" className="app-list-item text-white border-0 m-0">
                                            <div className="icon-stack">
                                                <i className="base base-7 icon-stack-3x opacity-100 color-primary-500 "></i>
                                                <i className="base base-7 icon-stack-2x opacity-100 color-primary-300 "></i>
                                                <i className="fal fa-home icon-stack-1x opacity-100 color-white"></i>
                                            </div>
                                            <span className="app-list-name">
                                                Home
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="page_inbox_general.html" className="app-list-item text-white border-0 m-0">
                                            <div className="icon-stack">
                                                <i className="base base-7 icon-stack-3x opacity-100 color-success-500 "></i>
                                                <i className="base base-7 icon-stack-2x opacity-100 color-success-300 "></i>
                                                <i className="ni ni-envelope icon-stack-1x text-white"></i>
                                            </div>
                                            <span className="app-list-name">
                                                Inbox
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="intel_introduction.html" className="app-list-item text-white border-0 m-0">
                                            <div className="icon-stack">
                                                <i className="base base-7 icon-stack-2x opacity-100 color-primary-300 "></i>
                                                <i className="fal fa-plus icon-stack-1x opacity-100 color-white"></i>
                                            </div>
                                            <span className="app-list-name">
                                                Add More
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <p id="js-color-profile" className="d-none">
                    <span className="color-primary-50"></span>
                    <span className="color-primary-100"></span>
                    <span className="color-primary-200"></span>
                    <span className="color-primary-300"></span>
                    <span className="color-primary-400"></span>
                    <span className="color-primary-500"></span>
                    <span className="color-primary-600"></span>
                    <span className="color-primary-700"></span>
                    <span className="color-primary-800"></span>
                    <span className="color-primary-900"></span>
                    <span className="color-info-50"></span>
                    <span className="color-info-100"></span>
                    <span className="color-info-200"></span>
                    <span className="color-info-300"></span>
                    <span className="color-info-400"></span>
                    <span className="color-info-500"></span>
                    <span className="color-info-600"></span>
                    <span className="color-info-700"></span>
                    <span className="color-info-800"></span>
                    <span className="color-info-900"></span>
                    <span className="color-danger-50"></span>
                    <span className="color-danger-100"></span>
                    <span className="color-danger-200"></span>
                    <span className="color-danger-300"></span>
                    <span className="color-danger-400"></span>
                    <span className="color-danger-500"></span>
                    <span className="color-danger-600"></span>
                    <span className="color-danger-700"></span>
                    <span className="color-danger-800"></span>
                    <span className="color-danger-900"></span>
                    <span className="color-warning-50"></span>
                    <span className="color-warning-100"></span>
                    <span className="color-warning-200"></span>
                    <span className="color-warning-300"></span>
                    <span className="color-warning-400"></span>
                    <span className="color-warning-500"></span>
                    <span className="color-warning-600"></span>
                    <span className="color-warning-700"></span>
                    <span className="color-warning-800"></span>
                    <span className="color-warning-900"></span>
                    <span className="color-success-50"></span>
                    <span className="color-success-100"></span>
                    <span className="color-success-200"></span>
                    <span className="color-success-300"></span>
                    <span className="color-success-400"></span>
                    <span className="color-success-500"></span>
                    <span className="color-success-600"></span>
                    <span className="color-success-700"></span>
                    <span className="color-success-800"></span>
                    <span className="color-success-900"></span>
                    <span className="color-fusion-50"></span>
                    <span className="color-fusion-100"></span>
                    <span className="color-fusion-200"></span>
                    <span className="color-fusion-300"></span>
                    <span className="color-fusion-400"></span>
                    <span className="color-fusion-500"></span>
                    <span className="color-fusion-600"></span>
                    <span className="color-fusion-700"></span>
                    <span className="color-fusion-800"></span>
                    <span className="color-fusion-900"></span>
                </p>

            </div>
        </div>
    </div>

    <nav className="shortcut-menu d-none d-sm-block">
        <input type="checkbox" className="menu-open" name="menu-open" id="menu_open" />
        <label htmlFor="menu_open" className="menu-open-button ">
            <span className="app-shortcut-icon d-block"></span>
        </label>
        <a href="#" className="menu-item btn" data-toggle="tooltip" data-placement="left" title="Scroll Top">
            <i className="fal fa-arrow-up"></i>
        </a>
        <a href="page_login_alt.html" className="menu-item btn" data-toggle="tooltip" data-placement="left" title="Logout">
            <i className="fal fa-sign-out"></i>
        </a>
        <a href="#" className="menu-item btn" data-action="app-fullscreen" data-toggle="tooltip" data-placement="left" title="Full Screen">
            <i className="fal fa-expand"></i>
        </a>
        <a href="#" className="menu-item btn" data-action="app-print" data-toggle="tooltip" data-placement="left" title="Print page">
            <i className="fal fa-print"></i>
        </a>
        <a href="#" className="menu-item btn" data-action="app-voice" data-toggle="tooltip" data-placement="left" title="Voice command">
            <i className="fal fa-microphone"></i>
        </a>
    </nav>

    <div className="modal fade js-modal-messenger modal-backdrop-transparent" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-right">
            <div className="modal-content h-100">
                <div className="dropdown-header bg-trans-gradient d-flex align-items-center w-100">
                    <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
                        <span className="mr-2">
                            <span className="rounded-circle profile-image d-block"></span>
                        </span>
                        <div className="info-card-text">
                            <a href="#" onClick={e => e.preventDefault()} className="fs-lg text-truncate text-truncate-lg text-white" data-toggle="dropdown" aria-expanded="false">
                                Tracey Chang
                                <i className="fal fa-angle-down d-inline-block ml-1 text-white fs-md"></i>
                            </a>
                            <div className="dropdown-menu">
                                <a className="dropdown-item" href="#">Send Email</a>
                                <a className="dropdown-item" href="#">Create Appointment</a>
                                <a className="dropdown-item" href="#">Block User</a>
                            </div>
                            <span className="text-truncate text-truncate-md opacity-80">IT Director</span>
                        </div>
                    </div>
                    <button type="button" className="close text-white position-absolute pos-top pos-right p-2 m-1 mr-2" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true"><i className="fal fa-times"></i></span>
                    </button>
                </div>
                <div className="modal-body p-0 h-100 d-flex">
                    <div className="msgr-list d-flex flex-column bg-faded border-faded border-top-0 border-right-0 border-bottom-0 position-absolute pos-top pos-bottom">
                        <div>
                            <div className="height-4 width-3 h3 m-0 d-flex justify-content-center flex-column color-primary-500 pl-3 mt-2">
                                <i className="fal fa-search"></i>
                            </div>
                            <input type="text" className="form-control bg-white" id="msgr_listfilter_input" placeholder="Filter contacts" aria-label="FriendSearch" data-listfilter="#js-msgr-listfilter"/>
                        </div>
                        <div className="flex-1 h-100 custom-scroll">
                            <div className="w-100">
                                <ul id="js-msgr-listfilter" className="list-unstyled m-0">
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="tracey chang online">
                                            <div className="d-table-cell align-middle status status-success status-sm ">
                                                <span className="profile-image-md rounded-circle d-block"  ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Tracey Chang
                                                    <small className="d-block font-italic text-success fs-xs">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="oliver kopyuv online">
                                            <div className="d-table-cell align-middle status status-success status-sm ">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Oliver Kopyuv
                                                    <small className="d-block font-italic text-success fs-xs">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="dr john cook phd away">
                                            <div className="d-table-cell align-middle status status-warning status-sm ">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Dr. John Cook PhD
                                                    <small className="d-block font-italic fs-xs">
                                                        Away
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney online">
                                            <div className="d-table-cell align-middle status status-success status-sm ">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Ali Amdaney
                                                    <small className="d-block font-italic fs-xs text-success">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="sarah mcbrook online">
                                            <div className="d-table-cell align-middle status status-success status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Sarah McBrook
                                                    <small className="d-block font-italic fs-xs text-success">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney offline">
                                            <div className="d-table-cell align-middle status status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    oliver.kopyuv@gotbootstrap.com
                                                    <small className="d-block font-italic fs-xs">
                                                        Offline
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney busy">
                                            <div className="d-table-cell align-middle status status-danger status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    oliver.kopyuv@gotbootstrap.com
                                                    <small className="d-block font-italic fs-xs text-danger">
                                                        Busy
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney offline">
                                            <div className="d-table-cell align-middle status status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    oliver.kopyuv@gotbootstrap.com
                                                    <small className="d-block font-italic fs-xs">
                                                        Offline
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney inactive">
                                            <div className="d-table-cell align-middle">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    +714651347790
                                                    <small className="d-block font-italic fs-xs opacity-50">
                                                        Missed Call
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                                <div className="filter-message js-filter-message"></div>
                            </div>
                        </div>
                        <div>
                            <a className="fs-xl d-flex align-items-center p-3">
                                <i className="fal fa-cogs"></i>
                            </a>
                        </div>
                    </div>

                    <div className="msgr d-flex h-100 flex-column bg-white">

                        <div className="custom-scroll flex-1 h-100">
                            <div id="chat_container" className="w-100 p-4">

                                <div className="chat-segment">
                                    <div className="time-stamp text-center mb-2 fw-400">
                                        Jun 19
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-sent">
                                    <div className="chat-message">
                                        <p>
                                            Hey Tracey, did you get my files?
                                        </p>
                                    </div>
                                    <div className="text-right fw-300 text-muted mt-1 fs-xs">
                                        3:00 pm
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get">
                                    <div className="chat-message">
                                        <p>
                                            Hi
                                        </p>
                                        <p>
                                            Sorry going through a busy time in office. Yes I analyzed the solution.
                                        </p>
                                        <p>
                                            It will require some resource, which I could not manage.
                                        </p>
                                    </div>
                                    <div className="fw-300 text-muted mt-1 fs-xs">
                                        3:24 pm
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-sent chat-start">
                                    <div className="chat-message">
                                        <p>
                                            Okay
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-sent chat-end">
                                    <div className="chat-message">
                                        <p>
                                            Sending you some dough today, you can allocate the resources to this project.
                                        </p>
                                    </div>
                                    <div className="text-right fw-300 text-muted mt-1 fs-xs">
                                        3:26 pm
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get chat-start">
                                    <div className="chat-message">
                                        <p>
                                            Perfect. Thanks a lot!
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get">
                                    <div className="chat-message">
                                        <p>
                                            I will have them ready by tonight.
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get chat-end">
                                    <div className="chat-message">
                                        <p>
                                            Cheers
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment">
                                    <div className="time-stamp text-center mb-2 fw-400">
                                        Jun 20
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="d-flex flex-column">
                            <div className="border-faded border-right-0 border-bottom-0 border-left-0 flex-1 mr-3 ml-3 position-relative shadow-top">
                                <div className="pt-3 pb-1 pr-0 pl-0 rounded-0" tabIndex="-1">
                                    <div id="msgr_input" contentEditable="true" data-placeholder="Type your message here..." className="height-10 form-content-editable"></div>
                                </div>
                            </div>
                            <div className="height-8 px-3 d-flex flex-row align-items-center flex-wrap flex-shrink-0">
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-icon fs-xl width-1 mr-1" data-toggle="tooltip" data-original-title="More options" data-placement="top">
                                    <i className="fal fa-ellipsis-v-alt color-fusion-300"></i>
                                </a>
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-icon fs-xl mr-1" data-toggle="tooltip" data-original-title="Attach files" data-placement="top">
                                    <i className="fal fa-paperclip color-fusion-300"></i>
                                </a>
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-icon fs-xl mr-1" data-toggle="tooltip" data-original-title="Insert photo" data-placement="top">
                                    <i className="fal fa-camera color-fusion-300"></i>
                                </a>
                                <div className="ml-auto">
                                    <a href="#" onClick={e => e.preventDefault()} className="btn btn-info">Send</a>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    </div>

    <div className="modal fade js-modal-settings modal-backdrop-transparent" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-right modal-md">
            <div className="modal-content">
                <div className="dropdown-header bg-trans-gradient d-flex justify-content-center align-items-center w-100">
                    <h4 className="m-0 text-center color-white">
                        Layout Settings
                        <small className="mb-0 opacity-80">User Interface Settings</small>
                    </h4>
                    <button type="button" className="close text-white position-absolute pos-top pos-right p-2 m-1 mr-2" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true"><i className="fal fa-times"></i></span>
                    </button>
                </div>
                <div className="modal-body p-0">
                    <div className="settings-panel">
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    App Layout
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="fh">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="header-function-fixed"></a>
                            <span className="onoffswitch-title">Fixed Header</span>
                            <span className="onoffswitch-title-desc">header is in a fixed at all times</span>
                        </div>
                        <div className="list" id="nff">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-fixed"></a>
                            <span className="onoffswitch-title">Fixed Navigation</span>
                            <span className="onoffswitch-title-desc">left panel is fixed</span>
                        </div>
                        <div className="list" id="nfm">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-minify"></a>
                            <span className="onoffswitch-title">Minify Navigation</span>
                            <span className="onoffswitch-title-desc">Skew nav to maximize space</span>
                        </div>
                        <div className="list" id="nfh">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-hidden"></a>
                            <span className="onoffswitch-title">Hide Navigation</span>
                            <span className="onoffswitch-title-desc">roll mouse on edge to reveal</span>
                        </div>
                        <div className="list" id="nft">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-top"></a>
                            <span className="onoffswitch-title">Top Navigation</span>
                            <span className="onoffswitch-title-desc">Relocate left pane to top</span>
                        </div>
                        <div className="list" id="mmb">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-main-boxed"></a>
                            <span className="onoffswitch-title">Boxed Layout</span>
                            <span className="onoffswitch-title-desc">Encapsulates to a container</span>
                        </div>
                        <div className="expanded">
                            <ul className="">
                                <li>
                                    <div className="bg-fusion-50" data-action="toggle" data-class="mod-bg-1"></div>
                                </li>
                                <li>
                                    <div className="bg-warning-200" data-action="toggle" data-class="mod-bg-2"></div>
                                </li>
                                <li>
                                    <div className="bg-primary-200" data-action="toggle" data-class="mod-bg-3"></div>
                                </li>
                                <li>
                                    <div className="bg-success-300" data-action="toggle" data-class="mod-bg-4"></div>
                                </li>
                            </ul>
                            <div className="list" id="mbgf">
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-fixed-bg"></a>
                                <span className="onoffswitch-title">Fixed Background</span>
                            </div>
                        </div>
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Mobile Menu
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="nmp">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-mobile-push"></a>
                            <span className="onoffswitch-title">Push Content</span>
                            <span className="onoffswitch-title-desc">Content pushed on menu reveal</span>
                        </div>
                        <div className="list" id="nmno">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-mobile-no-overlay"></a>
                            <span className="onoffswitch-title">No Overlay</span>
                            <span className="onoffswitch-title-desc">Removes mesh on menu reveal</span>
                        </div>
                        <div className="list" id="sldo">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-mobile-slide-out"></a>
                            <span className="onoffswitch-title">Off-Canvas <sup>(beta)</sup></span>
                            <span className="onoffswitch-title-desc">Content overlaps menu</span>
                        </div>
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Accessibility
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="mbf">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-bigger-font"></a>
                            <span className="onoffswitch-title">Bigger Content Font</span>
                            <span className="onoffswitch-title-desc">content fonts are bigger for readability</span>
                        </div>
                        <div className="list" id="mhc">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-high-contrast"></a>
                            <span className="onoffswitch-title">High Contrast Text (WCAG 2 AA)</span>
                            <span className="onoffswitch-title-desc">4.5:1 text contrast ratio</span>
                        </div>
                        <div className="list" id="mcb">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-color-blind"></a>
                            <span className="onoffswitch-title">Daltonism <sup>(beta)</sup> </span>
                            <span className="onoffswitch-title-desc">color vision deficiency</span>
                        </div>
                        <div className="list" id="mpc">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-pace-custom"></a>
                            <span className="onoffswitch-title">Preloader Inside</span>
                            <span className="onoffswitch-title-desc">preloader will be inside content</span>
                        </div>
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Global Modifications
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="mcbg">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-clean-page-bg"></a>
                            <span className="onoffswitch-title">Clean Page Background</span>
                            <span className="onoffswitch-title-desc">adds more whitespace</span>
                        </div>
                        <div className="list" id="mhni">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-hide-nav-icons"></a>
                            <span className="onoffswitch-title">Hide Navigation Icons</span>
                            <span className="onoffswitch-title-desc">invisible navigation icons</span>
                        </div>
                        <div className="list" id="dan">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-disable-animation"></a>
                            <span className="onoffswitch-title">Disable CSS Animation</span>
                            <span className="onoffswitch-title-desc">Disables CSS based animations</span>
                        </div>
                        <div className="list" id="mhic">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-hide-info-card"></a>
                            <span className="onoffswitch-title">Hide Info Card</span>
                            <span className="onoffswitch-title-desc">Hides info card from left panel</span>
                        </div>
                        <div className="list" id="mlph">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-lean-subheader"></a>
                            <span className="onoffswitch-title">Lean Subheader</span>
                            <span className="onoffswitch-title-desc">distinguished page header</span>
                        </div>
                        <div className="list" id="mnl">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-nav-link"></a>
                            <span className="onoffswitch-title">Hierarchical Navigation</span>
                            <span className="onoffswitch-title-desc">Clear breakdown of nav links</span>
                        </div>
                        <div className="list mt-1">
                            <span className="onoffswitch-title">Global Font Size <small>(RESETS ON REFRESH)</small> </span>
                            <div className="btn-group btn-group-sm btn-group-toggle my-2" data-toggle="buttons">
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text-sm" data-target="html">
                                    <input type="radio" name="changeFrontSize"/> SM
                                </label>
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text" data-target="html">
                                    <input type="radio" name="changeFrontSize" defaultChecked={true}/> MD
                                </label>
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text-lg" data-target="html">
                                    <input type="radio" name="changeFrontSize"/> LG
                                </label>
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text-xl" data-target="html">
                                    <input type="radio" name="changeFrontSize"/> XL
                                </label>
                            </div>
                            <span className="onoffswitch-title-desc d-block mb-0">Change <strong>root</strong> font size to effect rem
                                values</span>
                        </div>
                        <hr className="mb-0 mt-4" />
                        <div className="mt-2 d-table w-100 pl-5 pr-3">
                            <div className="fs-xs text-muted p-2 alert alert-warning mt-3 mb-2">
                                <i className="fal fa-exclamation-triangle text-warning mr-2"></i>The settings below uses localStorage to load
                                the external CSS file as an overlap to the base css. Due to network latency and CPU utilization, you may
                                experience a brief flickering effect on page load which may show the intial applied theme for a split
                                second. Setting the prefered style/theme in the header will prevent this from happening.
                            </div>
                        </div>
                        <div className="mt-2 d-table w-100 pl-5 pr-3">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Theme colors
                                </h5>
                            </div>
                        </div>
                        <div className="expanded theme-colors pl-5 pr-3">
                            <ul className="m-0">
                                <li>
                                    <a href="#" id="myapp-0" data-action="theme-update" data-themesave data-theme="" data-toggle="tooltip" data-placement="top" title="Wisteria (base css)" data-original-title="Wisteria (base css)"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-1" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-1.css" data-toggle="tooltip" data-placement="top" title="Tapestry" data-original-title="Tapestry"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-2" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-2.css" data-toggle="tooltip" data-placement="top" title="Atlantis" data-original-title="Atlantis"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-3" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-3.css" data-toggle="tooltip" data-placement="top" title="Indigo" data-original-title="Indigo"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-4" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-4.css" data-toggle="tooltip" data-placement="top" title="Dodger Blue" data-original-title="Dodger Blue"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-5" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-5.css" data-toggle="tooltip" data-placement="top" title="Tradewind" data-original-title="Tradewind"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-6" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-6.css" data-toggle="tooltip" data-placement="top" title="Cranberry" data-original-title="Cranberry"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-7" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-7.css" data-toggle="tooltip" data-placement="top" title="Oslo Gray" data-original-title="Oslo Gray"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-8" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-8.css" data-toggle="tooltip" data-placement="top" title="Chetwode Blue" data-original-title="Chetwode Blue"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-9" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-9.css" data-toggle="tooltip" data-placement="top" title="Apricot" data-original-title="Apricot"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-10" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-10.css" data-toggle="tooltip" data-placement="top" title="Blue Smoke" data-original-title="Blue Smoke"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-11" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-11.css" data-toggle="tooltip" data-placement="top" title="Green Smoke" data-original-title="Green Smoke"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-12" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-12.css" data-toggle="tooltip" data-placement="top" title="Wild Blue Yonder" data-original-title="Wild Blue Yonder"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-13" data-action="theme-update" data-themesave data-theme="css/themes/cust-theme-13.css" data-toggle="tooltip" data-placement="top" title="Emerald" data-original-title="Emerald"></a>
                                </li>
                            </ul>
                        </div>
                        <hr className="mb-0 mt-4" />
                        <div className="pl-5 pr-3 py-3 bg-faded">
                            <div className="row no-gutters">
                                <div className="col-6 pr-1">
                                    <a href="#" className="btn btn-outline-danger fw-500 btn-block" data-action="app-reset">Reset Settings</a>
                                </div>
                                <div className="col-6 pl-1">
                                    <a href="#" className="btn btn-danger fw-500 btn-block" data-action="factory-reset">Factory Reset</a>
                                </div>
                            </div>
                        </div>

                    </div> <span id="saving"></span>
                </div>
            </div>
        </div>
    </div>

    </div>
  );
}
componentDidMount() {
    const script = document.createElement("script");
    script.async = false;
    script.src = "/js/vendors.bundle.js";
    // For body
    document.body.appendChild(script);

    const script2 = document.createElement("script");
    script2.async = false;
    script2.src = "/js/app.bundle.js";
    // For body
    document.body.appendChild(script2);

  }
}

export default Navigation;
