<?php
	class Database {
		public function connect() {
			$username = "root";
			$password = "";
			$hostname = "localhost";
			// $dbname = "geovetph";
			$dbname = "geovetph_proxy";

			$this->mysqli = mysqli_connect($hostname, $username, $password, $dbname)
				or die("Error ".mysqli_error($this->mysqli));
			$this->mysqli->set_charset('utf8');
		}

		public function disconnect() {
			$this->mysqli_close();
		}

		public function getRegions() {
			$stmt = "SELECT * FROM region";
			return $this->get($stmt);
		}

		public function getProvinces($region_id) {
			$stmt = "SELECT * FROM province WHERE region_id = {$region_id}";
			return $this->get($stmt);
		}

		public function getLocalities($province_id) {
			$stmt = "SELECT * FROM locality WHERE province_id = {$province_id}";
			return $this->get($stmt);
		}

		public function getRegionId($region) {
			$short_name = $region[0];
			$long_name = $region[1];
			$stmt = "SELECT * FROM region WHERE name = \"{$short_name}\" OR name = \"{$long_name}\" OR long_name = \"{$short_name}\" OR long_name = \"{$long_name}\" LIMIT 1";
			return $this->get($stmt);
		}

		public function getProvinceId($province, $region_id) {
			$stmt = "SELECT * FROM province WHERE name = \"{$province}\" AND region_id = {$region_id} LIMIT 1";
			return $this->get($stmt);
		}

		public function getLocalityId($locality, $province_id) {
			$stmt = "SELECT * FROM locality WHERE name = \"{$locality}\" AND province_id = {$province_id} LIMIT 1";
			return $this->get($stmt);
		}

		public function getAnimalSpecies() {
			$stmt = "SELECT * FROM animal";
			return $this->get($stmt);
		}

		public function getAnimalGroups() {
			$stmt = "SELECT animal_group, COUNT(common_name) AS species_count FROM animal GROUP BY animal_group";
			return $this->get($stmt);
		}

		public function getDiseases() {
			$stmt = "SELECT * FROM disease";
			return $this->get($stmt);
		}

		public function getDiseasePost($filter) {			
			$dateCondition = $this->formatDateCondition($filter->date);
			$animalCondition = $this->formatAnimalCondition($filter->animal);
			$diseaseCondition = $this->formatDiseaseCondition($filter->disease);
			$locationCondition = $this->formatLocationCondition($filter->location);

			$stmt  = "SELECT ";
			$stmt .= "post_id, user_id, date_posted, message, locality_id, locality_name, locality_type, province_id, province_name, region.region_id, region.name AS region_name, region.long_name AS region_long_name, common_name, animal_group, disease_name, strain ";
			$stmt .= "FROM ";
			$stmt .= "(";
			$stmt .= "SELECT ";
			$stmt .= "post_id, user_id, date_posted, message, locality_id, locality_name, locality_type, province.province_id, province.name AS province_name, region_id, common_name, animal_group, disease_name, strain ";
    		$stmt .= "FROM ";
			$stmt .= "(";
			$stmt .= "SELECT ";
			$stmt .= "post_id, user_id, date_posted, message, locality.locality_id, locality.name AS locality_name, locality_type, province_id, common_name, animal_group, disease_name, strain ";
			$stmt .= "FROM ";
			$stmt .= "(";
			$stmt .= "SELECT ";
			$stmt .= "* ";
			$stmt .= "FROM ";
			$stmt .= "disease_post ";
			$stmt .= "WHERE {$dateCondition}";
			if($animalCondition) $stmt .= " AND {$animalCondition}";
			if($diseaseCondition) $stmt .= " AND {$diseaseCondition}";
			if($locationCondition[0]) $stmt .= " AND {$locationCondition[0]}";
			$stmt .= ") AS a ";
			$stmt .= "LEFT JOIN locality ON a.locality_id = locality.locality_id ";
			$stmt .= "LEFT JOIN animal ON a.animal_id = animal.animal_id ";
			$stmt .= "LEFT JOIN disease ON a.disease_id = disease.disease_id";
			if($locationCondition[1]) $stmt .= " WHERE {$locationCondition[1]}";
			$stmt .= ") AS b ";
			$stmt .= "LEFT JOIN province ON b.province_id = province.province_id";
			if($locationCondition[2]) $stmt .= " WHERE {$locationCondition[2]}";
			$stmt .= ") AS c ";
			$stmt .= "LEFT JOIN region ON c.region_id = region.region_id";

			return $this->get($stmt);
		}

		private function formatDateCondition($data) {
			if($data->from == $data->to) {
				return "(date_posted = \"{$data->from}\")";
			}
			else {
				return "(date_posted BETWEEN \"{$data->from}\" AND \"{$data->to}\")";
			}
		}

		private function formatAnimalCondition($data) {
			switch(count($data)) {
				case 1:
					return "(animal_id = {$data[0]})";
					break;
				case 0:
					return false;
					break;
				default:
					return "(animal_id IN (" . join(",", $data) . "))";
					break;
			}
		}

		private function formatDiseaseCondition($data) {
			switch(count($data)) {
				case 1:
					return "(disease_id = {$data[0]})";
					break;
				case 0:
					return false;
					break;
				default:
					return "(disease_id IN (" . join(",", $data) . "))";
					break;
			}
		}

		private function formatLocationCondition($data) {
			$localityCondition = (is_null($data->localityId))? false : "(locality_id = {$data->localityId})";
			$regionCondition = (is_null($data->regionId))? false : "(region_id = {$data->regionId})";
			$provinceCondition = (is_null($data->provinceId))? false : "(province_id = {$data->provinceId})";
			return [$localityCondition, $provinceCondition, $regionCondition];
		}

		private function get($stmt) {
			$result = $this->mysqli->query($stmt);
			$return = array();
			if($result->num_rows > 0) {
				while($row = $result->fetch_assoc()) {
					array_push($return, $row);
				}
				return $return;
			}
			else {
				return -1;
			}
		}

		// use prepared statements for inserts
	}

	$db = new Database();
	$db->connect();

	switch($_POST['func']) {
		case 'get':
			switch ($_POST['type']) {
				case 0: // get all regions used by AddressManager
					$results = $db->getRegions();
					if($results) echo json_encode($results);
					else echo $results;
					break;
				case 1: // get all provinces in provided region; used by AddressManager
					$region_id = $_POST['id'];
					$results = $db->getProvinces($region_id);
					if($results) echo json_encode($results);
					else echo $results;
					break;
				case 2: // get all municipalitites and cities in provided province; used by AddressManager
					$province_id = $_POST['id'];
					$results = $db->getLocalities($province_id);
					if($results) echo json_encode($results);
					else echo $results;
					break;
				case 3: // get all animal categories and species; used by DataFilter
					$animalSpecies = $db->getAnimalSpecies();
					$animalGroups = $db->getAnimalGroups();
					if($animalSpecies || $animalGroups) {
						$results = new stdClass();
						$results->animalGroups = $animalGroups;
						$results->animalSpecies = $animalSpecies;
						echo json_encode($results);
					}
					else echo -1;
					break;
				case 4: // get all diseases; used by DataFilter
					$results = $db->getDiseases();
					if($results) echo json_encode($results);
					else echo $results;
					break;
				case 5: // get ids for location values; used by AddressManager
					$locality = $_POST['locality'];
					$province = $_POST['province'];
					$region = $_POST['region'];

					$region_result = $db->getRegionId($region);
					$province_result = $db->getProvinceId($province, $region_result[0]['region_id']);
					$locality_result = $db->getLocalityId($locality, $province_result[0]['province_id']);
					if($region_result && $province_result && $locality_result) {
						$results = new stdClass();
						$results->region = $region_result[0];
						$results->province = $province_result[0];
						$results->locality = $locality_result[0];
						echo json_encode($results);
					}
					else echo -1;
					break;
				case 6: // get all disease_post filtered by the provided data; used by DataManager
					$filter = json_decode($_POST['filter']);
					$results = $db->getDiseasePost($filter);
					if($results) echo json_encode($results);
					else echo $results;
					break;
			}
			break;
		default:
			break;
	}
?>