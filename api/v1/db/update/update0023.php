<?php

function update0023($conn) {
    $result = array();
    $result['result'] = false;

    $query1 = $conn->prepare('ALTER TABLE "camera" ADD COLUMN "aiGroupTokenID" BIGINT DEFAULT 0');
    if (!$query1->execute()) {
        $result['step'] = 1;
        $result['error'] = $query1->errorInfo();
        return $result;
    }

    $result['result'] = true;
    return $result;
}
