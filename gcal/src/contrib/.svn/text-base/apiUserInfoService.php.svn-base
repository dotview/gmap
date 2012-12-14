<?php
/*
 * Copyright (c) 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

require_once 'service/apiModel.php';
require_once 'service/apiService.php';
require_once 'service/apiServiceRequest.php';


  /**
   * The "webfonts" collection of methods.
   * Typical usage is:
   *  <code>
   *   $UserInfoService = new apiUserInfoService(...);
   *   $userinfo = $UserInfoService->userinfo;
   *  </code>
   */
  class UserInfoServiceResource extends apiServiceResource {


    /**
     * Retrieves the list of fonts currently served by the Google Web Fonts Developer API
     * (webfonts.list)
     *
     * @param array $optParams Optional parameters. Valid optional parameters are listed below.
     *
     * @opt_param string sort Enables sorting of the list
     * @return WebfontList
     */
    public function userinfo($token,$optParams = array()) {
      $params = array('access_token'=>$token);
      $params = array_merge($params, $optParams);print_r($params);
      $data = $this->__call('get', array($params));
      if ($this->useObjects()) {
        return $data;
      } else {
        return $data;
      }
    }
  }



/**
 * Service definition for userinfocall (v1).
 *
 * <p>
 * The Google Web userinfocall Developer API.
 * </p>
 *
 * <p>
 * For more information about this service, see the
 * <a href="http://code.google.com/apis/accounts/docs/OAuth2Login.html#userinfocall" target="_blank">API Documentation</a>
 * </p>
 *
 * @author Google, Inc.
 */
class apiUserInfoService extends apiService {
  public $userinfo;
  /**
   * Constructs the internal representation of the userinfo service.
   *
   * @param apiClient apiClient
   */
  public function __construct(apiClient $apiClient) {
    $this->rpcPath = '/rpc';
    $this->restBasePath = '/oauth2/v1/';
    $this->version = 'v1';
    $this->serviceName = 'userinfo';
    $this->io = $apiClient->getIo();

    $apiClient->addService($this->serviceName, $this->version);
    $this->userinfo = new UserInfoServiceResource($this, $this->serviceName, 'userinfo', json_decode('{"methods": {"get": {"id": "userinfo.userinfo.get", "httpMethod": "GET", "path": "userinfo", "response": {"$ref": "WebfontList"}}}}', true));
  }
}

class UserInfo extends apiModel {
  public $id;
  public $email;
  public $name;
  public $picture;
  public $gender;

  public function setName($name) {
    $this->name = $name;
  }
  public function getName() {
    return $this->name;
  }
  public function setSubsets($Picture) {
    $this->picture = $picture;
  }
  public function getPicture() {
    return $this->picture;
  }
  public function setGender($gender) {
    $this->gender = $gender;
  }
  public function getGender() {
    return $this->gender;
  }
}
