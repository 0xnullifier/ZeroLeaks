include "../node_modules/circomlib/circuits/comparators.circom";

template CircomContinousTest(n,k){
    signal input big_arr[n];
    signal input small_arr[k];
    signal input starting_index;

    component is_equals[k][n]; 
    signal middle_constraint[k][n];

    for(var i=0; i<k; i++){
        for(var j = 0; j <n; j++){
            is_equals[i][j] = IsEqual();
            is_equals[i][j].in[0] <== j;
            is_equals[i][j].in[1] <== starting_index + i;
            middle_constraint[i][j] <== small_arr[i] * is_equals[i][j].out;
            big_arr[j] === middle_constraint[i][j] + big_arr[j] * (1 - is_equals[i][j].out);
        }
    }

}


component main = CircomContinousTest(1524,256);
