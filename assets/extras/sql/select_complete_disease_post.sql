-- SELECT 
--     post_id,
--     user_id,
--     date_posted,
--     disease_name,
--     strain,
--     message,
--     common_name,
--     animal_group,
--     locality_name,
--     locality_type,
--     province_name,
--     region_name,
--     region_long_name
-- FROM
--     (SELECT 
--         post_id,
-- 		disease_id,
--         user_id,
--         date_posted,
--         message,
--         locality_name,
--         locality_type,
--         province_name,
--         region_name,
--         region_long_name,
--         common_name,
--         animal_group
--     FROM
--         (SELECT 
-- 			post_id,
--             disease_id,
--             animal_id,
--             user_id,
--             date_posted,
--             message,
--             locality_name,
--             locality_type,
--             province_name,
--             region.name AS region_name,
--             region.long_name AS region_long_name
-- 		FROM
-- 			(SELECT 
-- 				post_id,
-- 				disease_id,
-- 				animal_id,
-- 				user_id,
-- 				date_posted,
-- 				message,
-- 				locality_name,
-- 				locality_type,
-- 				province.name AS province_name,
-- 				province.region_id
-- 			FROM
-- 				(SELECT 
-- 					post_id,
-- 					disease_id,
-- 					animal_id,
-- 					user_id,
-- 					date_posted,
-- 					message,
-- 					locality.name AS locality_name,
-- 					locality_type,
-- 					province_id
-- 				FROM
-- 					disease_post
-- 				LEFT JOIN locality ON disease_post.locality_id = locality.locality_id) AS dpl
-- 			LEFT JOIN province ON dpl.province_id = province.province_id) AS dplp
-- 		LEFT JOIN region ON dplp.region_id = region.region_id) AS dplpr
--     LEFT JOIN animal ON dplpr.animal_id = animal.animal_id) AS dplpra
-- LEFT JOIN disease ON dplpra.disease_id = disease.disease_id;

-- SELECT 
--     post_id,
--     user_id,
--     date_posted,
--     message,
--     locality_name,
--     locality_type,
--     province_name,
--     region_name,
--     region_long_name,
--     common_name,
--     animal_group,
--     disease_name,
--     strain
-- FROM
--     (SELECT 
--         post_id,
--         disease_id,
--         animal_id,
--         user_id,
--         date_posted,
--         message,
--         locality_name,
--         locality_type,
--         province_name,
--         region.name AS region_name,
--         region.long_name AS region_long_name
--     FROM
--         (SELECT 
--             post_id,
--             disease_id,
--             animal_id,
--             user_id,
--             date_posted,
--             message,
--             locality_name,
--             locality_type,
--             province.name AS province_name,
--             province.region_id
--         FROM
--             (SELECT 
--                 post_id,
--                 disease_id,
--                 animal_id,
--                 user_id,
--                 date_posted,
--                 message,
--                 locality.name AS locality_name,
--                 locality_type,
--                 province_id
--             FROM disease_post
--             LEFT JOIN locality ON disease_post.locality_id = locality.locality_id)
--             AS dpl
--         LEFT JOIN province ON dpl.province_id = province.province_id)
--         AS dplp
--     LEFT JOIN region ON dplp.region_id = region.region_id)
--     AS dplpr,
--     animal,
--     disease
-- WHERE
--     dplpr.animal_id = animal.animal_id
--     AND dplpr.disease_id = disease.disease_id;

SELECT 
	post_id,
	user_id,
	date_posted,
	message,
	locality_name,
	locality_type,
	province_name,
	region.name AS region_name,
	region.long_name AS region_long_name,
	common_name,
	animal_group,
	disease_name,
	strain
FROM
	(SELECT 
		post_id,
		user_id,
		date_posted,
		message,
		locality_name,
		locality_type,
		province.name AS province_name,
		region_id,
		common_name,
		animal_group,
		disease_name,
		strain
	FROM
		(SELECT 
			post_id,
			user_id,
			date_posted,
			message,
			locality.name AS locality_name,
			locality_type,
			province_id,
			common_name,
			animal_group,
			disease_name,
			strain
		FROM
			disease_post
		LEFT JOIN locality ON disease_post.locality_id = locality.locality_id
		LEFT JOIN animal ON disease_post.animal_id = animal.animal_id
		LEFT JOIN disease ON disease_post.disease_id = disease.disease_id) AS a
	LEFT JOIN province ON a.province_id = province.province_id) AS b
LEFT JOIN region ON b.region_id = region.region_id;