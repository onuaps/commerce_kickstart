<?php

/**
 * Implements hook_form_alter().
 *
 * Allows the profile to alter the site configuration form.
 */
function commerce_kickstart_form_install_configure_form_alter(&$form, $form_state) {
  // Set a default name for the dev site.
  $form['site_information']['site_name']['#default_value'] = t('Commerce Kickstart');

  // Set a default country so we can benefit from it on Address Fields.
  $form['server_settings']['site_default_country']['#default_value'] = 'US';
}

/**
 * Implements hook_install_tasks().
 */
function commerce_kickstart_install_tasks() {
  $tasks = array();

  // Add a page allowing the user to indicate they'd like to install demo content.
  $tasks['commerce_kickstart_example_store_form'] = array(
    'display_name' => st('Example store'),
    'type' => 'form',
  );

  return $tasks;
}

/**
 * Task callback: returns the form allowing the user to add example store
 * content on install.
 */
function commerce_kickstart_example_store_form() {
  drupal_set_title(st('Example store content'));

  // Prepare all the options for example content.
  $options = array(
    'products' => t('Products'),
    'product_displays' => t('Node displays for example products'),
  );

  $form['example_content'] = array(
    '#type' => 'checkboxes',
    '#title' => st('Create example content for the following store components:'),
    '#description' => st('The example content is not comprehensive but illustrates how the basic components work.'),
    '#options' => $options,
    '#default_value' => drupal_map_assoc(array_keys($options)),
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => st('Create and continue'),
    '#weight' => 15,
  );

  return $form;
}

/**
 * Submit callback: creates the requested example content.
 */
function commerce_kickstart_example_store_form_submit(&$form, &$form_state) {
  if (!empty($form_state['values']['example_content'])) {
    $example_content = $form_state['values']['example_content'];
    $created_products = array();
    $created_nodes = array();

    // First create products if specified.
    if (in_array('products', $example_content)) {
      $product_names = array(
        '01' => st('Product One'),
        '02' => st('Product Two'),
        '03' => st('Product Three')
      );

      foreach ($product_names as $sku => $title) {
        // Create the new product.
        $product = commerce_product_new('product');
        $product->sku = 'PROD-' . $sku;
        $product->title = $title;
        $product->uid = 1;

        // Set a default price.
        $product->commerce_price[LANGUAGE_NONE][0]['amount'] = $sku * 1000;
        $product->commerce_price[LANGUAGE_NONE][0]['currency_code'] = 'USD';

        // Save it and retain a copy.
        commerce_product_save($product);
        $created_products[] = $product;

        // Create a node display for the product if specified.
        if (in_array('product_displays', $example_content)) {
          // Create the new node.
          $node = (object) array('type' => 'product_display');
          node_object_prepare($node);
          $node->title = $product->title;
          $node->uid = 1;

          // Reference the product we just made.
          $node->field_product[LANGUAGE_NONE][]['product_id'] = $product->product_id;

          // Save it and retain a copy.
          node_save($node);
          $created_nodes[] = $node;
        }
      }
    }
  }
}
