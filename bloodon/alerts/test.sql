-- check if current place inside a rectangle
select * from system_organization where  (latitude BETWEEN 36.07352228885536 AND 36.9163606561519) AND (longitude BETWEEN 9.832763671875 AND 10.57708740234375 );
-- check if current place inside circle with the give radius (10 km
Select id, latitude , longitude,
((2 * 3960 * ATAN2(SQRT(POWER(SIN((RADIANS(36.7702423663 - latitude))/2), 2) + COS(RADIANS(latitude)) * COS(RADIANS(36.7702423663 )) * POWER(SIN((RADIANS(10.1942825317 - longitude))/2), 2) ), SQRT(1-( POWER(SIN((RADIANS(36.7702423663 - latitude))/2), 2) + COS(RADIANS(latitude)) * COS(RADIANS(36.7702423663)) * POWER(SIN((RADIANS(10.1942825317 - longitude))/2), 2) )) ) )) As D
From ( Select id, latitude, longitude From system_organization  Where latitude Between 36.725276286 And 36.8152084466 And longitude Between 10.1381480729 And 10.2504169905) As FirstCut
Where ((2 * 3960 * ATAN2(SQRT(POWER(SIN((RADIANS(36.7702423663 - latitude))/2), 2) + COS(RADIANS(latitude)) * COS(RADIANS(36.7702423663 )) * POWER(SIN((RADIANS(10.1942825317 - longitude))/2), 2) ), SQRT(1-( POWER(SIN((RADIANS(36.7702423663 - latitude))/2), 2) + COS(RADIANS(latitude)) * COS(RADIANS(36.7702423663)) * POWER(SIN((RADIANS(10.1942825317 - longitude))/2), 2) )) ) )) < 10
Order by D;