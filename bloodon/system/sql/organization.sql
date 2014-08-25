-- for create the database with encoding = utf8 ------------> create database bloodi character set utf8 COLLATE utf8_general_ci;
-- use as it's option for sql in command line --default-character-set=utf8
-- Dumping data for table `system_organization`
--

INSERT INTO `system_organization` 
    VALUES (1,1,null,null,'مستشفى الرَابطة','',' rabeta',7050,'tunis',36.8022922253207,10.1549988985062),
    (2,1,null,null,'مستشفى شارل نيكول','charles nicolles','https://ar.wikipedia.org/wiki/%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89_%D8%B4%D8%A7%D8%B1%D9%84_%D9%86%D9%8A%D9%83%D9%88%D9%84', 1006 ,'Boulevard du 9-Avril 1938',36.8027904818918,10.1613610982895),
    (3,1,null,null,'مستشفى عزيزة عثمانة','aziza othmana','https://ar.wikipedia.org/wiki/%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89_%D8%B9%D8%B2%D9%8A%D8%B2%D8%A9_%D8%B9%D8%AB%D9%85%D8%A7%D9%86%D8%A9',1008,'Place de la Kasbah',36.796747,10.169089),
    (4,1,null,null,'مستشفى محمد البوعزيزي','mohamed bouaziziz','https://ar.wikipedia.org/wiki/%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89_%D9%85%D8%AD%D9%85%D8%AF_%D8%A7%D9%84%D8%A8%D9%88%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A',NULL,'Ben Arous',36.746893,10.212924),
    (5,1,null,null,'معهد صالح عزيز','saleh azaiz','https://ar.wikipedia.org/wiki/%D9%85%D8%B9%D9%87%D8%AF_%D8%B5%D8%A7%D9%84%D8%AD_%D8%B9%D8%B2%D9%8A%D8%B2',1006,'Boulevard du 9-Avril 1938',36.807251,10.158429);